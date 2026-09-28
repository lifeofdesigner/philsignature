-- ==============================================================================
-- PHILZ SIGNATURE — 022_allow_admins_to_manage_payment_gateway_secrets.sql
-- Allow admins (super_admin, admin, administrator, staff) to read and update
-- all site_settings, including payment_gateway_secrets, so administrators
-- have full access to configure Paystack, Flutterwave, Korapay, and other payment gateways.
-- ==============================================================================

DROP POLICY IF EXISTS "Super admins manage payment gateway secrets" ON site_settings;
DROP POLICY IF EXISTS "Admins manage non-secret site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON site_settings;

CREATE POLICY "Admins manage site settings"
    ON site_settings FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

