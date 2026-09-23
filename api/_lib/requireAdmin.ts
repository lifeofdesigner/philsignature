import type { VercelRequest } from '@vercel/node';
import { supabaseAdmin } from './supabaseAdmin';

export interface CallerProfile {
  id: string;
  email: string | null;
  role: string;
  is_active: boolean;
}

const STAFF_TIER_ROLES = ['super_admin', 'staff', 'admin', 'administrator'];

/**
 * Validates the caller's Supabase access token (sent as `Authorization: Bearer <token>`)
 * server-side and returns their profile, or null if unauthenticated/invalid/inactive.
 * This never trusts anything the client claims about its own role.
 */
export async function getCallerProfile(req: VercelRequest): Promise<CallerProfile | null> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, is_active')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) return null;
  return profile as CallerProfile;
}

export function isStaffTier(role: string): boolean {
  return STAFF_TIER_ROLES.includes(role);
}

export function isSuperAdmin(role: string): boolean {
  return role === 'super_admin';
}
