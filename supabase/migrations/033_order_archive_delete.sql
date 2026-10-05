-- ==============================================================================
-- PHILZ SIGNATURE — 033_order_archive_delete.sql
-- Pre-launch cleanup: allow admins to archive (soft-delete) or permanently
-- delete test/fake orders before real customers start ordering.
-- ==============================================================================

-- 1. Add archived flag to orders
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_archived ON public.orders (archived);

-- 2. RLS: only admin-tier roles may update the archived flag or delete orders.
-- SELECT policy already permits owner-or-admin reads (migration 024); archived
-- orders stay visible to admins so they can inspect/restore them, and remain
-- invisible to customers in the default (non-archived) storefront views since
-- customer-facing queries always filter archived = false application-side.

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders"
    ON public.orders FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Super admins delete orders" ON public.orders;
CREATE POLICY "Super admins delete orders"
    ON public.orders FOR DELETE
    USING (is_super_admin());

-- Deleting an order must also remove its dependent rows (order_items,
-- order_timeline) so a hard delete doesn't leave orphaned data or get
-- blocked by a FK constraint.
DROP POLICY IF EXISTS "Super admins delete order items" ON public.order_items;
CREATE POLICY "Super admins delete order items"
    ON public.order_items FOR DELETE
    USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins delete order timeline" ON public.order_timeline;
CREATE POLICY "Super admins delete order timeline"
    ON public.order_timeline FOR DELETE
    USING (is_super_admin());

NOTIFY pgrst, 'reload schema';
