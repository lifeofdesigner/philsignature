-- ==============================================================================
-- PHILZ SIGNATURE — 018_widen_is_admin_to_admin_roles.sql
-- Fix "new row violates row-level security policy" on every admin write
-- (CMS content, media/storage uploads, orders, settings) for accounts with
-- role = 'admin' or 'administrator'.
--
-- Root cause: is_admin() only recognized 'super_admin' and 'staff'. But the
-- app's own permission model (src/lib/permissions.ts ROLE_PERMISSIONS) grants
-- 'admin'/'administrator' nearly every write capability (cms, media, products,
-- orders, customers, reviews, coupons, users/roles) - only settings:manage,
-- security:manage, and delete:anything are withheld, and those are already
-- enforced separately at the UI/route layer (canAccessAdminPath, AdminGuard-
-- gated tabs). The DB-level check was simply never updated to match, so any
-- admin-role account got RLS-rejected on writes the UI told them they could do.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND role IN ('super_admin', 'staff', 'admin', 'administrator')
        AND is_active = true
    );
$$;
