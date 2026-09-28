-- ==============================================================================
-- PHILZ SIGNATURE — 021_restrict_product_variants_write_to_admins.sql
-- 009 left product_variants writable by ANY client (USING (true) WITH CHECK
-- (true)), including anonymous storefront visitors using only the public
-- anon key -- anyone could INSERT/UPDATE/DELETE size variants (price, stock,
-- SKU) directly via the Supabase client SDK. Now that the admin product form
-- writes real variant data through this table, tighten it to match every
-- other catalog table's convention (public read, is_admin() write).
-- ==============================================================================

DROP POLICY IF EXISTS "Admin and service role full access on product variants" ON public.product_variants;

CREATE POLICY "Admins manage product variants"
    ON public.product_variants FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
