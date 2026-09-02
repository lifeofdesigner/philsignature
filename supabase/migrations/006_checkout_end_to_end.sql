-- ==============================================================================
-- PHILZ SIGNATURE — 006_checkout_end_to_end.sql
-- End-to-end checkout support: coupon column, timeline RLS, guest order viewing, payment confirmation
-- ==============================================================================

-- 1. Ensure notes, coupon_code, and order_item columns exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_slug TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_image_url TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total NUMERIC(12, 2);

NOTIFY pgrst, 'reload schema';

-- 2. Allow timeline milestone insertion for any created order
DROP POLICY IF EXISTS "Anyone can insert order timeline" ON public.order_timeline;
CREATE POLICY "Anyone can insert order timeline"
    ON public.order_timeline FOR INSERT
    WITH CHECK (true);

-- 3. Allow customers and guests to view orders they placed
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
CREATE POLICY "Customers view own orders"
    ON public.orders FOR SELECT
    USING (customer_id = auth.uid() OR is_admin() OR customer_id IS NULL);

DROP POLICY IF EXISTS "Customers view own order items" ON public.order_items;
CREATE POLICY "Customers view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = auth.uid() OR is_admin() OR orders.customer_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Customers view own order timeline" ON public.order_timeline;
CREATE POLICY "Customers view own order timeline"
    ON public.order_timeline FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_timeline.order_id
            AND (orders.customer_id = auth.uid() OR is_admin() OR orders.customer_id IS NULL)
        )
    );

-- 4. Allow payment status update for pending orders
DROP POLICY IF EXISTS "Allow payment confirmation on pending orders" ON public.orders;
CREATE POLICY "Allow payment confirmation on pending orders"
    ON public.orders FOR UPDATE
    USING (financial_status = 'pending')
    WITH CHECK (true);

-- 5. Stored function for atomic payment confirmation
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
    UPDATE orders
    SET financial_status = 'paid',
        payment_reference = p_reference,
        updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with ID % not found', p_order_id;
    END IF;

    -- Insert payment confirmed milestone in timeline
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
