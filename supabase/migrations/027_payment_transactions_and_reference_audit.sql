-- ==============================================================================
-- PHILZ SIGNATURE — 027_payment_transactions_and_reference_audit.sql
-- 1. Create payment_transactions audit table to log every payment attempt separately
-- 2. Maintain full payment attempt history across all retries
-- 3. Ensure orders table allows storing distinct payment references without collisions
-- ==============================================================================

-- 1. Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    reference TEXT NOT NULL UNIQUE,
    gateway TEXT NOT NULL CHECK (gateway IN ('paystack', 'flutterwave', 'korapay', 'bank_transfer', 'cod')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'initialized' CHECK (status IN ('initialized', 'pending', 'success', 'failed', 'cancelled', 'abandoned')),
    authorization_url TEXT,
    access_code TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_number ON public.payment_transactions(order_number);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Customers can view their own payment transactions
DROP POLICY IF EXISTS "Customers view own payment transactions" ON public.payment_transactions;
CREATE POLICY "Customers view own payment transactions"
    ON public.payment_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_transactions.order_id
            AND (orders.customer_id = auth.uid() OR is_admin())
        )
    );

-- Admins manage all payment transactions
DROP POLICY IF EXISTS "Admins manage payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins manage payment transactions"
    ON public.payment_transactions FOR ALL
    USING (is_admin());

-- Service role full access for webhooks and backend initialization
DROP POLICY IF EXISTS "Service role manages payment transactions" ON public.payment_transactions;
CREATE POLICY "Service role manages payment transactions"
    ON public.payment_transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Add last_payment_reference and payment_attempts_count to orders table if not exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_attempts_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
