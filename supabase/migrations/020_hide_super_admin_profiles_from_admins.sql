-- ==============================================================================
-- PHILZ SIGNATURE — 020_hide_super_admin_profiles_from_admins.sql
-- Regular admins (admin/administrator/staff, widened into is_admin() by 018)
-- must never be able to see who holds the Super Admin role. Previously
-- "Users can read own profile" granted is_admin() unrestricted SELECT over
-- every profile row, so a non-super admin could read super_admin accounts
-- directly (the admin UI only hid this client-side). Same for UPDATE, even
-- though 017 already blocks self-escalation to super_admin.
-- ==============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id
        OR is_super_admin()
        OR (is_admin() AND role <> 'super_admin')
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id
        OR is_super_admin()
        OR (is_admin() AND role <> 'super_admin')
    )
    WITH CHECK (
        auth.uid() = id
        OR is_super_admin()
        OR (is_admin() AND role <> 'super_admin')
    );
