-- ==============================================================================
-- PHILZ SIGNATURE — 003_functions_and_triggers.sql
-- Stored Procedures, Functions & Triggers
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRIGGER FUNCTION: update_updated_at_column
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to tables
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_shipping_methods_updated_at
    BEFORE UPDATE ON shipping_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customer_addresses_updated_at
    BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cms_content_updated_at
    BEFORE UPDATE ON cms_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. TRIGGER FUNCTION: handle_new_user (Auth Sync)
-- Automatically provisions public.profiles row when auth.users is created
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role TEXT := 'customer';
BEGIN
    -- Check if first registered user or matching bootstrap admin email
    IF (SELECT COUNT(*) FROM profiles) = 0 THEN
        default_role := 'super_admin';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        COALESCE(NEW.raw_user_meta_data->>'role', default_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. TRIGGER FUNCTION: update_product_rating
-- Recomputes rating average and review count when reviews mutate
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_product_id UUID;
    v_avg NUMERIC(3, 2);
    v_count INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE product_id = target_product_id
    AND status IN ('approved', 'featured');

    UPDATE products
    SET
        rating = v_avg,
        reviews_count = v_count,
        updated_at = NOW()
    WHERE id = target_product_id;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_rating_calc
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ------------------------------------------------------------------------------
-- 4. FUNCTION: decrement_product_stock
-- Atomic inventory deduction for checkouts
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
    p_product_id UUID,
    p_quantity INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET
        stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id
    AND stock_quantity >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product id %', p_product_id;
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. FUNCTION: increment_product_stock
-- Restocking on cancellations or returns
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_product_stock(
    p_product_id UUID,
    p_quantity INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET
        stock_quantity = stock_quantity + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. FUNCTION: track_consignment
-- Public RPC to track an order securely without exposing other records
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_consignment(
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
    SELECT * INTO v_order
    FROM orders
    WHERE UPPER(order_number) = UPPER(p_order_number)
    AND LOWER(email) = LOWER(p_email);

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT jsonb_agg(to_jsonb(i)) INTO v_items
    FROM order_items i
    WHERE i.order_id = v_order.id;

    SELECT jsonb_agg(to_jsonb(t) ORDER BY t.created_at ASC) INTO v_timeline
    FROM order_timeline t
    WHERE t.order_id = v_order.id;

    RETURN jsonb_build_object(
        'order_number', v_order.order_number,
        'financial_status', v_order.financial_status,
        'fulfillment_status', v_order.fulfillment_status,
        'created_at', v_order.created_at,
        'total_amount', v_order.total_amount,
        'items', COALESCE(v_items, '[]'::jsonb),
        'timeline', COALESCE(v_timeline, '[]'::jsonb)
    );
END;
$$;

