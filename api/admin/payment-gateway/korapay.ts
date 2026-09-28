import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { getCallerProfile, isStaffTier } from '../../_lib/requireAdmin';

const SECRET_SETTINGS_KEY = 'payment_gateway_secrets';

// Whitelist of the only fields this endpoint is ever allowed to touch.
// Regular admins may update their own Korapay keys this way; every other
// gateway's secrets stay untouched no matter what the request body contains.
const KORAPAY_FIELDS = [
  'korapay_test_public_key',
  'korapay_test_secret_key',
  'korapay_live_public_key',
  'korapay_live_secret_key',
] as const;

type KorapayField = (typeof KORAPAY_FIELDS)[number];

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

    const body = (req.body || {}) as Partial<Record<KorapayField, unknown>>;
    const updates: Partial<Record<KorapayField, string>> = {};
    for (const field of KORAPAY_FIELDS) {
      if (typeof body[field] === 'string' && body[field] !== '') {
        updates[field] = body[field] as string;
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid Korapay fields provided' });
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
          description: 'Payment gateway API credentials (admin-only)',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}
