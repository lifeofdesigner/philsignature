-- ==============================================================================
-- PHILZ SIGNATURE — 016_add_korapay_payment_method.sql
-- Allow 'korapay' as a valid orders.payment_method value.
-- ==============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_payment_method_check
    CHECK (payment_method IN ('paystack', 'flutterwave', 'korapay', 'bank_transfer', 'cod'));
