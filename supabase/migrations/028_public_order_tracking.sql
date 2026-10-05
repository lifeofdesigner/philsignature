-- ==============================================================================
-- PHILZ SIGNATURE — 028_public_order_tracking.sql
-- Allow guest and registered customers to track orders by order number
-- Sanitizes tracking output to avoid exposing internal IDs, gateway secrets or system logs
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.track_guest_order(
    p_order_number TEXT,
    p_email TEXT DEFAULT NULL
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

    -- If email is provided and not empty, check both order number and email
    IF p_email IS NOT NULL AND TRIM(p_email) <> '' THEN
        SELECT * INTO v_order
        FROM orders
        WHERE LOWER(TRIM(order_number)) = LOWER(TRIM(p_order_number))
          AND LOWER(TRIM(email)) = LOWER(TRIM(p_email));
    ELSE
        -- Support lookup by order number alone
        SELECT * INTO v_order
        FROM orders
        WHERE LOWER(TRIM(order_number)) = LOWER(TRIM(p_order_number));
    END IF;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Aggregate line items with customer-safe presentation fields
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'product_slug', oi.product_slug,
            'product_image_url', oi.product_image_url,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
        )
    ) INTO v_items
    FROM order_items oi
    WHERE oi.order_id = v_order.id;

    -- Aggregate timeline milestones (sorted chronologically)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', ot.id,
            'title', ot.title,
            'description', ot.description,
            'status', ot.status,
            'created_at', ot.created_at
        ) ORDER BY ot.created_at ASC
    ) INTO v_timeline
    FROM order_timeline ot
    WHERE ot.order_id = v_order.id;

    -- Return customer-facing order representation
    RETURN jsonb_build_object(
        'order_number', v_order.order_number,
        'created_at', v_order.created_at,
        'updated_at', v_order.updated_at,
        'financial_status', v_order.financial_status,
        'fulfillment_status', v_order.fulfillment_status,
        'subtotal', v_order.subtotal,
        'shipping_amount', v_order.shipping_amount,
        'discount_amount', v_order.discount_amount,
        'tax_amount', v_order.tax_amount,
        'total_amount', v_order.total_amount,
        'payment_method', v_order.payment_method,
        'shipping_address', jsonb_build_object(
            'first_name', COALESCE(v_order.shipping_address->>'first_name', ''),
            'city', COALESCE(v_order.shipping_address->>'city', ''),
            'state', COALESCE(v_order.shipping_address->>'state', ''),
            'country', COALESCE(v_order.shipping_address->>'country', '')
        ),
        'items', COALESCE(v_items, '[]'::jsonb),
        'timeline', COALESCE(v_timeline, '[]'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_guest_order(TEXT, TEXT) TO anon, authenticated, service_role;
