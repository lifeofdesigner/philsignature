-- =============================================================================
-- 038_create_order_rpc.sql
-- SECURITY DEFINER function so anon (guest) callers can INSERT an order and
-- get the full row back without being blocked by the SELECT RLS policy.
-- The SELECT policy requires customer_id = auth.uid() which is impossible for
-- guest orders (customer_id IS NULL), causing the RETURNING clause to fail and
-- the client to roll back a successfully-inserted order.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_order_header(order_data jsonb)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.orders (
    order_number,
    customer_id,
    email,
    phone,
    financial_status,
    fulfillment_status,
    subtotal,
    shipping_amount,
    discount_amount,
    tax_amount,
    tax_rate,
    total_amount,
    payment_method,
    shipping_address,
    billing_address,
    notes,
    customer_notes,
    coupon_code
  ) VALUES (
    order_data->>'order_number',
    -- customer_id: JSON null  →  SQL NULL; non-null string  →  cast to uuid
    CASE
      WHEN order_data->'customer_id' IS NULL OR order_data->>'customer_id' IS NULL THEN NULL
      ELSE (order_data->>'customer_id')::uuid
    END,
    order_data->>'email',
    order_data->>'phone',
    COALESCE(order_data->>'financial_status', 'pending'),
    COALESCE(order_data->>'fulfillment_status', 'pending'),
    (order_data->>'subtotal')::numeric,
    COALESCE((order_data->>'shipping_amount')::numeric, 0),
    COALESCE((order_data->>'discount_amount')::numeric, 0),
    COALESCE((order_data->>'tax_amount')::numeric, 0),
    COALESCE((order_data->>'tax_rate')::numeric, 0),
    (order_data->>'total_amount')::numeric,
    order_data->>'payment_method',
    order_data->'shipping_address',
    CASE
      WHEN order_data->'billing_address' IS NULL THEN order_data->'shipping_address'
      ELSE order_data->'billing_address'
    END,
    NULLIF(order_data->>'notes', ''),
    NULLIF(order_data->>'notes', ''),
    NULLIF(order_data->>'coupon_code', '')
  )
  RETURNING *;
END;
$$;

-- Allow any authenticated or anon role to call this function
GRANT EXECUTE ON FUNCTION public.create_order_header(jsonb) TO anon, authenticated;
