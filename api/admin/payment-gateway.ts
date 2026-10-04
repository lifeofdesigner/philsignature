import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getCallerProfile, isStaffTier } from '../_lib/requireAdmin.js';

const SECRET_SETTINGS_KEY = 'payment_gateway_secrets';

const ALLOWED_FIELDS = {
  paystack: [
    'paystack_test_public_key',
    'paystack_test_secret_key',
    'paystack_live_public_key',
    'paystack_live_secret_key',
  ],
  flutterwave: [
    'flutterwave_test_public_key',
    'flutterwave_test_secret_key',
    'flutterwave_test_webhook_secret_hash',
    'flutterwave_live_public_key',
    'flutterwave_live_secret_key',
    'flutterwave_live_webhook_secret_hash',
  ],
  korapay: [
    'korapay_test_public_key',
    'korapay_test_secret_key',
    'korapay_live_public_key',
    'korapay_live_secret_key',
  ],
} as const;

type GatewayType = keyof typeof ALLOWED_FIELDS;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const caller = await getCallerProfile(req);
    if (!caller || !isStaffTier(caller.role)) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { gateway } = req.query as { gateway?: string };
    const targetGateway = (gateway || req.body?.gateway) as GatewayType;

    if (!targetGateway || !ALLOWED_FIELDS[targetGateway]) {
      res.status(400).json({ error: `Valid gateway parameter ('paystack', 'flutterwave', 'korapay') is required` });
      return;
    }

    const allowed = ALLOWED_FIELDS[targetGateway] as readonly string[];
    const body = (req.body || {}) as Record<string, unknown>;
    const updates: Record<string, string> = {};

    for (const field of allowed) {
      if (typeof body[field] === 'string' && body[field] !== '') {
        updates[field] = body[field] as string;
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid gateway fields provided' });
      return;
    }

    const { data: existing } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', SECRET_SETTINGS_KEY)
      .maybeSingle();

    const mergedValue = {
      ...(existing?.value as Record<string, unknown> | null),
      ...updates,
    };

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        {
          key: SECRET_SETTINGS_KEY,
          value: mergedValue,
          description: 'Encrypted and restricted payment gateway API keys',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true, updatedFields: Object.keys(updates) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
}
