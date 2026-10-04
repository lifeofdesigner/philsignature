import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { getCallerProfile, isStaffTier, isSuperAdmin, logAdminAction } from '../../_lib/requireAdmin';
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

  await logAdminAction(caller, 'UPDATE_USER_ROLE', 'profiles', userId, { newRole: role, previousRole: target?.role }, req);

  res.status(200).json({ success: true });
}
