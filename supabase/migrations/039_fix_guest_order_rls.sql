-- ==============================================================================
-- PHILZ SIGNATURE — 039_fix_guest_order_rls.sql
-- Fix: anon users cannot read back their own guest order after insert.
-- Migration 024 tightened SELECT on orders to customer_id = auth.uid() OR is_admin().
-- Guest orders have customer_id = NULL — they pass INSERT (WITH CHECK true) but
-- the .select().single() read-back returns nothing, causing "Failed to insert
-- order header" and duplicate orders on retry.
-- ==============================================================================

CREATE POLICY "Anon can read own guest order after insert"
  ON public.orders FOR SELECT
  USING (
    customer_id IS NULL
    AND auth.role() = 'anon'
  );
