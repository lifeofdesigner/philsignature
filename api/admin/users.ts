import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getCallerProfile, isStaffTier, isSuperAdmin, logAdminAction } from '../_lib/requireAdmin.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limit: 60 requests/min per IP
  if (!checkRateLimit(req, res, 60, 60000, 'admin_api')) {
    return;
  }

  const caller = await getCallerProfile(req);
  if (!caller || !isStaffTier(caller.role)) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  const action = (req.query.action || req.body?.action) as string | undefined;

  // 1. LIST USERS (GET or POST with action=list)
  if (req.method === 'GET' || action === 'list') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ users: data });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 2. CREATE USER
  if (action === 'create') {
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

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (data?.user?.id) {
      await supabaseAdmin.from('profiles').upsert(
        {
          id: data.user.id,
          email: String(email).trim().toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      await logAdminAction(caller, 'CREATE_USER', 'profiles', data.user.id, { role }, req);
    }

    res.status(201).json({ user: data.user });
    return;
  }

  // 3. DELETE USER
  if (action === 'delete') {
    if (!isSuperAdmin(caller.role)) {
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
    return;
  }

  // 4. SET PASSWORD
  if (action === 'set-password') {
    if (!isSuperAdmin(caller.role)) {
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

    await logAdminAction(caller, 'RESET_USER_PASSWORD', 'profiles', userId, undefined, req);
    res.status(200).json({ success: true });
    return;
  }

  // 5. SET ROLE
  if (action === 'set-role') {
    const { userId, role } = req.body || {};
    if (!userId || !role) {
      res.status(400).json({ error: 'userId and role are required' });
      return;
    }

    if (role === 'super_admin' && !isSuperAdmin(caller.role)) {
      res.status(403).json({ error: 'Only a Super Administrator can assign the Super Admin role' });
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

    await logAdminAction(caller, 'UPDATE_ROLE', 'profiles', userId, { newRole: role }, req);
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ error: 'Invalid or missing action parameter' });
}
