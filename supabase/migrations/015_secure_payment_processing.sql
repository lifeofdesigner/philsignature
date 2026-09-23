-- ==============================================================================
-- PHILZ SIGNATURE — 015_secure_payment_processing.sql
-- Close the payment-confirmation trust gap and protect gateway secret keys.
-- ==============================================================================

-- 1. Remove the overly-permissive policy that let ANY client (including
--    anonymous customers) flip any pending order to "paid" with an arbitrary
--    reference via a direct table update. Payment confirmation must now only
--    happen server-side (webhook/verify endpoints using the service-role key,
--    which always bypasses RLS) or by an admin (covered by the pre-existing
--    "Admins manage orders" policy from 002_security_rls.sql).
DROP POLICY IF EXISTS "Allow payment confirmation on pending orders" ON public.orders;

-- 2. Add the same authorization check inside confirm_order_payment(), since
--    SECURITY DEFINER functions bypass RLS entirely regardless of table
--    policies. This RPC is currently unused by the app but is reachable by
--    any client via PostgREST, so it must not be left as an open door.
CREATE OR REPLACE FUNCTION public.confirm_order_payment(
    p_order_id UUID,
    p_reference TEXT,
    p_payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order RECORD;
BEGIN
    IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
        RAISE EXCEPTION 'Not authorized to confirm payment';
    END IF;

    UPDATE orders
    SET financial_status = 'paid',
        payment_reference = p_reference,
        updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with ID % not found', p_order_id;
    END IF;

    INSERT INTO order_timeline (order_id, status, title, description)
    VALUES (
        p_order_id,
        'paid',
        'Payment Confirmed',
        'Payment verified successfully via ' || INITCAP(p_payment_method) || '. Reference: ' || p_reference
    );

    RETURN to_jsonb(v_order);
END;
$$;

-- 3. Protect payment gateway secret keys. `site_settings` currently allows
--    "Public view site settings ON site_settings FOR SELECT USING (true)" —
--    meaning any anonymous browser client can read every settings row,
--    including gateway secret keys stored under the 'payment_gateway_secrets'
--    key. Restrict SELECT on that specific key to admins only; everything
--    else (public keys, enabled flags, bank transfer display info, etc.)
--    remains publicly readable since the storefront checkout needs it.
DROP POLICY IF EXISTS "Public view site settings" ON site_settings;

CREATE POLICY "Public view non-secret site settings"
    ON site_settings FOR SELECT
    USING (key <> 'payment_gateway_secrets' OR is_admin());
