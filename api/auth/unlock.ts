import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 10 unlock attempts per min per IP
  if (!checkRateLimit(req, res, 10, 60000, 'auth_unlock')) {
    return;
  }

  const { email, token } = req.body || {};
  if (!email || !token) {
    return res.status(400).json({ error: 'Email and unlock token are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  try {
    const { data: unlocked, error } = await supabaseAdmin.rpc('unlock_account_with_token', {
      p_email: cleanEmail,
      p_token: token.trim(),
    });

    if (error || !unlocked) {
      return res.status(400).json({ error: 'Invalid or expired unlock token.' });
    }

    await supabaseAdmin.from('activity_logs').insert({
      action: 'AUTH_ACCOUNT_UNLOCKED_API',
      entity_type: 'auth_security',
      entity_id: cleanEmail,
      ip_address: clientIp,
      user_agent: userAgent,
      details: { email: cleanEmail },
    });

    return res.status(200).json({
      success: true,
      message: 'Your account has been successfully unlocked. You may now sign in.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unlock error';
    return res.status(500).json({ error: message });
  }
}
