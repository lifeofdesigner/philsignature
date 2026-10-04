import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { getCallerProfile, isSuperAdmin, logAdminAction } from '../../_lib/requireAdmin';
import { checkRateLimit } from '../../_lib/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Rate limit: 60 requests/min per IP
  if (!checkRateLimit(req, res, 60, 60000, 'admin_api')) {
    return;
  }

  const caller = await getCallerProfile(req);
  if (!caller || !isSuperAdmin(caller.role)) {
    res.status(403).json({ error: 'Only a Super Administrator can delete accounts' });
    return;
  }

  const { userId } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  await logAdminAction(caller, 'DELETE_USER', 'profiles', userId, undefined, req);

  res.status(200).json({ success: true });
}
