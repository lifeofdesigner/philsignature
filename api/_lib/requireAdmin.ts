import type { VercelRequest } from '@vercel/node';
import { supabaseAdmin } from './supabaseAdmin.js';

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

/**
 * Enterprise Audit Logger: Records caller ID, action, entity, IP, and User-Agent
 */
export async function logAdminAction(
  caller: CallerProfile,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
  req?: VercelRequest
): Promise<void> {
  try {
    let ip = '127.0.0.1';
    let userAgent = 'unknown';
    if (req) {
      const xForwardedFor = req.headers['x-forwarded-for'];
      ip =
        (typeof xForwardedFor === 'string'
          ? xForwardedFor.split(',')[0].trim()
          : Array.isArray(xForwardedFor)
            ? xForwardedFor[0].trim()
            : req.socket?.remoteAddress) || '127.0.0.1';
      userAgent = (req.headers['user-agent'] as string) || 'unknown';
    }

    await supabaseAdmin.from('activity_logs').insert({
      user_id: caller.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch (err) {
    console.warn('[Admin Audit Log Error]:', err);
  }
}
