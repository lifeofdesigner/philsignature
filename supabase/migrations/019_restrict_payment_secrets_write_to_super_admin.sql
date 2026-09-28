-- ==============================================================================
-- PHILZ SIGNATURE — 019_restrict_payment_secrets_write_to_super_admin.sql
-- Regular admins (admin/administrator/staff) can manage most site_settings,
-- but must not be able to directly overwrite the payment_gateway_secrets
-- blob (which holds every gateway's live/test API keys) via the client SDK,
-- since 018 widened is_admin() to include non-super-admin roles.
--
-- Direct writes to that key are now restricted to super_admin. Regular
-- admins who are granted the 'payments:manage_paystack' permission instead
-- update their Paystack keys through the api/admin/payment-gateway/paystack
-- serverless endpoint, which uses the service-role key (bypasses RLS) and
-- enforces that only paystack_* fields are ever touched.
-- ==============================================================================

DROP POLICY IF EXISTS "Admins manage site settings" ON site_settings;

CREATE POLICY "Admins manage non-secret site settings"
    ON site_settings FOR ALL
    USING (key <> 'payment_gateway_secrets' AND is_admin())
    WITH CHECK (key <> 'payment_gateway_secrets' AND is_admin());

CREATE POLICY "Super admins manage payment gateway secrets"
    ON site_settings FOR ALL
    USING (key = 'payment_gateway_secrets' AND is_super_admin())
    WITH CHECK (key = 'payment_gateway_secrets' AND is_super_admin());
