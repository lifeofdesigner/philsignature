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

  const { email, password, firstName, lastName, role } = req.body || {};
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: 'email, password, firstName, lastName, and role are required' });
    return;
  }

  if (role === 'super_admin' && !isSuperAdmin(caller.role)) {
    res.status(403).json({ error: 'Only a Super Administrator can create a Super Admin account' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: String(email).trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (error || !data.user) {
    res.status(400).json({ error: error?.message || 'User creation failed' });
    return;
  }

  // The handle_new_user trigger creates the profile row asynchronously; wait briefly then set role.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, role })
    .eq('id', data.user.id);

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ success: true, userId: data.user.id });
}
