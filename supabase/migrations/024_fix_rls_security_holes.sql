-- ==============================================================================
-- PHILZ SIGNATURE — 024_fix_rls_security_holes.sql
-- Enterprise Security Hardening: Close 3 Live Vulnerabilities
-- 1. Guest order data leak (orders, order_items, order_timeline)
-- 2. Notification data exposure (notifications table)
-- 3. Storage bucket security (private avatars & customer documents, signed URLs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX ORDERS, ORDER_ITEMS, AND ORDER_TIMELINE RLS
-- ------------------------------------------------------------------------------

-- Drop leaky policies on orders
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;

-- Secure orders SELECT policy: only account owner or authenticated admin
CREATE POLICY "Customers view own orders"
    ON public.orders FOR SELECT
    USING (
        (customer_id IS NOT NULL AND customer_id = auth.uid())
        OR is_admin()
    );

-- Drop leaky policies on order_items
DROP POLICY IF EXISTS "Customers view own order items" ON public.order_items;

CREATE POLICY "Customers view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND ((orders.customer_id IS NOT NULL AND orders.customer_id = auth.uid()) OR is_admin())
        )
    );

-- Drop leaky policies on order_timeline
DROP POLICY IF EXISTS "Customers view own order timeline" ON public.order_timeline;

CREATE POLICY "Customers view own order timeline"
    ON public.order_timeline FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_timeline.order_id
            AND ((orders.customer_id IS NOT NULL AND orders.customer_id = auth.uid()) OR is_admin())
        )
    );

-- ------------------------------------------------------------------------------
-- 2. SECURE GUEST ORDER TRACKING RPC
-- Allows guest customers to track their consignment ONLY by supplying both
-- matching order number and exact email address. Completely blocks table harvesting.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_guest_order(
    p_order_number TEXT,
    p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order RECORD;
    v_items JSONB;
    v_timeline JSONB;
BEGIN
    IF p_order_number IS NULL OR TRIM(p_order_number) = '' THEN
        RETURN NULL;
    END IF;

    -- If email is provided, require exact match (case-insensitive)
    IF p_email IS NOT NULL AND TRIM(p_email) <> '' THEN
        SELECT * INTO v_order
        FROM orders
        WHERE LOWER(TRIM(order_number)) = LOWER(TRIM(p_order_number))
          AND LOWER(TRIM(email)) = LOWER(TRIM(p_email));
    ELSE
        -- If email omitted, only permit if authenticated user owns the order or is admin
        SELECT * INTO v_order
        FROM orders
        WHERE LOWER(TRIM(order_number)) = LOWER(TRIM(p_order_number))
          AND (
              (customer_id IS NOT NULL AND customer_id = auth.uid())
              OR is_admin()
          );
    END IF;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Aggregate line items
    SELECT jsonb_agg(to_jsonb(oi)) INTO v_items
    FROM order_items oi
    WHERE oi.order_id = v_order.id;

    -- Aggregate timeline
    SELECT jsonb_agg(to_jsonb(ot) ORDER BY ot.created_at ASC) INTO v_timeline
    FROM order_timeline ot
    WHERE ot.order_id = v_order.id;

    RETURN to_jsonb(v_order) || jsonb_build_object(
        'items', COALESCE(v_items, '[]'::jsonb),
        'timeline', COALESCE(v_timeline, '[]'::jsonb)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. FIX NOTIFICATIONS RLS EXPOSURE
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;

-- Customers can only read notifications intended for them (user_id = auth.uid()).
-- Admins can view broadcast/system notifications (user_id IS NULL) and all alerts.
CREATE POLICY "Users view own or admin notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
        (user_id = auth.uid())
        OR (user_id IS NULL AND is_admin())
        OR is_admin()
    );

-- Users can only mark their own notifications as read; admins can manage admin ones.
CREATE POLICY "Users update own or admin notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (
        (user_id = auth.uid())
        OR (user_id IS NULL AND is_admin())
        OR is_admin()
    )
    WITH CHECK (
        (user_id = auth.uid())
        OR (user_id IS NULL AND is_admin())
        OR is_admin()
    );

-- Insert policy: authenticated users can only create notifications for themselves;
-- admins and service_role can notify any user.
CREATE POLICY "Users and system create notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        (user_id = auth.uid())
        OR is_admin()
    );

-- ------------------------------------------------------------------------------
-- 4. STORAGE SECURITY HARDENING
-- Ensure avatars and private documents are NOT publicly scrapable.
-- ------------------------------------------------------------------------------

-- Make avatars bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'avatars';

-- Ensure private_documents bucket exists for sensitive customer assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'private_documents',
    'private_documents',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Remove public access to avatars
DROP POLICY IF EXISTS "Public can view avatar assets" ON storage.objects;

-- Only account owner or admin can read avatars
CREATE POLICY "Users view own avatar"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'avatars'
        AND (
            (auth.uid())::text = (storage.foldername(name))[1]
            OR is_admin()
        )
    );

-- Private documents access policy
DROP POLICY IF EXISTS "Users view own private documents" ON storage.objects;
CREATE POLICY "Users view own private documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'private_documents'
        AND (
            (auth.uid())::text = (storage.foldername(name))[1]
            OR is_admin()
        )
    );

DROP POLICY IF EXISTS "Users manage own private documents" ON storage.objects;
CREATE POLICY "Users manage own private documents"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'private_documents'
        AND (
            (auth.uid())::text = (storage.foldername(name))[1]
            OR is_admin()
        )
    );

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
