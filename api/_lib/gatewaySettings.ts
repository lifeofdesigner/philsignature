import { supabaseAdmin } from './supabaseAdmin.js';

export type GatewayMode = 'test' | 'live';
export type GatewayName = 'paystack' | 'flutterwave' | 'korapay';

interface PublicSettings {
  paystack_enabled: boolean;
  paystack_mode: GatewayMode;
  flutterwave_enabled: boolean;
  flutterwave_mode: GatewayMode;
  korapay_enabled: boolean;
  korapay_mode: GatewayMode;
}

interface SecretSettings {
  paystack_test_secret_key: string;
  paystack_live_secret_key: string;
  paystack_test_public_key: string;
  paystack_live_public_key: string;
  flutterwave_test_secret_key: string;
  flutterwave_live_secret_key: string;
  flutterwave_test_webhook_secret_hash: string;
  flutterwave_live_webhook_secret_hash: string;
  flutterwave_test_public_key: string;
  flutterwave_live_public_key: string;
  korapay_test_secret_key: string;
  korapay_live_secret_key: string;
  korapay_test_public_key: string;
  korapay_live_public_key: string;
}

async function getSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return null;
  return data.value as T;
}

/**
 * Resolves the currently-active secret key + mode for a gateway, reading
 * directly from Supabase with the service-role key (bypasses RLS - this
 * must only ever run server-side).
 */
export async function getGatewayCredentials(gateway: GatewayName): Promise<{
  enabled: boolean;
  mode: GatewayMode;
  secretKey: string;
  publicKey: string;
  webhookSecretHash?: string;
}> {
  const [publicSettings, secretSettings] = await Promise.all([
    getSetting<PublicSettings>('payment_gateways'),
    getSetting<SecretSettings>('payment_gateway_secrets'),
  ]);

  const enabled = Boolean(publicSettings?.[`${gateway}_enabled` as keyof PublicSettings] ?? true);
  const mode =
    (publicSettings?.[`${gateway}_mode` as keyof PublicSettings] as GatewayMode) ||
    ((process.env.PAYSTACK_MODE as GatewayMode) || 'test');

  const secretKeyField = `${gateway}_${mode}_secret_key` as keyof SecretSettings;
  let secretKey = secretSettings?.[secretKeyField] || '';

  // Fallback to environment variables if not present in site_settings
  if (!secretKey && gateway === 'paystack') {
    secretKey =
      (mode === 'live'
        ? process.env.PAYSTACK_LIVE_SECRET_KEY
        : process.env.PAYSTACK_TEST_SECRET_KEY) ||
      process.env.PAYSTACK_SECRET_KEY ||
      '';
  }

  const publicKeyField = `${gateway}_${mode}_public_key` as keyof SecretSettings;
  const publicKey = secretSettings?.[publicKeyField] || '';

  let webhookSecretHash: string | undefined;
  if (gateway === 'flutterwave') {
    const hashField = `flutterwave_${mode}_webhook_secret_hash` as keyof SecretSettings;
    webhookSecretHash = secretSettings?.[hashField] || '';
  }

  return { enabled, mode, secretKey, publicKey, webhookSecretHash };
}
