import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { getCallerProfile, isStaffTier, isSuperAdmin } from '../../_lib/requireAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await getCallerProfile(req);
  if (!caller || !isStaffTier(caller.role)) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  const { userId, role } = req.body || {};
  if (!userId || !role) {
    res.status(400).json({ error: 'userId and role are required' });
    return;
  }

  if (role === 'super_admin' && !isSuperAdmin(caller.role)) {
    res.status(403).json({ error: 'Only a Super Administrator can assign the Super Admin role' });
    return;
  }

  const { data: target } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (target?.role === 'super_admin' && !isSuperAdmin(caller.role)) {
    res.status(403).json({ error: 'Only a Super Administrator can change a Super Admin\'s role' });
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ success: true });
}
