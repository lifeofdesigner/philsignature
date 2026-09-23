import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { getCallerProfile, isSuperAdmin } from '../../_lib/requireAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await getCallerProfile(req);
  if (!caller || !isSuperAdmin(caller.role)) {
    res.status(403).json({ error: 'Only a Super Administrator can reset passwords' });
    return;
  }

  const { userId, password } = req.body || {};
  if (!userId || !password) {
    res.status(400).json({ error: 'userId and password are required' });
    return;
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ success: true });
}
