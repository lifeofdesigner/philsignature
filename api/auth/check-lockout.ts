import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 20 per min per IP
  if (!checkRateLimit(req, res, 20, 60000, 'auth_check_lockout')) {
    return;
  }

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('check_account_lockout', {
      p_email: email.trim().toLowerCase(),
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || { is_locked: false, remaining_seconds: 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lockout check error';
    return res.status(500).json({ error: message });
  }
}
