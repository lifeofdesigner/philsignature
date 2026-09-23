import { supabaseAdmin } from './supabaseAdmin';

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
  flutterwave_test_secret_key: string;
  flutterwave_live_secret_key: string;
  flutterwave_test_webhook_secret_hash: string;
  flutterwave_live_webhook_secret_hash: string;
  korapay_test_secret_key: string;
  korapay_live_secret_key: string;
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
  webhookSecretHash?: string;
}> {
  const [publicSettings, secretSettings] = await Promise.all([
    getSetting<PublicSettings>('payment_gateways'),
    getSetting<SecretSettings>('payment_gateway_secrets'),
  ]);

  const enabled = Boolean(publicSettings?.[`${gateway}_enabled` as keyof PublicSettings]);
  const mode = (publicSettings?.[`${gateway}_mode` as keyof PublicSettings] as GatewayMode) || 'test';

  const secretKeyField = `${gateway}_${mode}_secret_key` as keyof SecretSettings;
  const secretKey = secretSettings?.[secretKeyField] || '';

  let webhookSecretHash: string | undefined;
  if (gateway === 'flutterwave') {
    const hashField = `flutterwave_${mode}_webhook_secret_hash` as keyof SecretSettings;
    webhookSecretHash = secretSettings?.[hashField] || '';
  }

  return { enabled, mode, secretKey, webhookSecretHash };
}
