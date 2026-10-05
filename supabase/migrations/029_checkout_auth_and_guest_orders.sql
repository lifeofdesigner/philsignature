-- ==============================================================================
-- PHILZ SIGNATURE — 029_checkout_auth_and_guest_orders.sql
-- 1. Seeds 'guest_checkout' into site_settings ('enabled' by default)
-- 2. Creates RPC public.link_guest_orders(p_user_id UUID, p_email TEXT)
-- 3. Creates trigger on public.profiles to link historical guest orders on signup
-- ==============================================================================

-- 1. SEED GUEST CHECKOUT CONFIGURATION
INSERT INTO public.site_settings (key, value, description, created_at, updated_at)
VALUES (
    'guest_checkout',
    '"enabled"'::jsonb,
    'Allow customers to complete purchases without creating an account',
    NOW(),
    NOW()
)
ON CONFLICT (key) DO NOTHING;

-- 2. RPC TO LINK HISTORICAL GUEST ORDERS TO ACCOUNT
CREATE OR REPLACE FUNCTION public.link_guest_orders(
    p_user_id UUID,
    p_email TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_user_id IS NULL OR p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN 0;
    END IF;

    UPDATE public.orders
    SET customer_id = p_user_id,
        updated_at = NOW()
    WHERE customer_id IS NULL
      AND LOWER(TRIM(email)) = LOWER(TRIM(p_email));

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_guest_orders(UUID, TEXT) TO authenticated, anon, service_role;

-- 3. TRIGGER ON PROFILES TO LINK ORDERS ON REGISTRATION
CREATE OR REPLACE FUNCTION public.handle_profile_order_linking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.id IS NOT NULL AND NEW.email IS NOT NULL AND TRIM(NEW.email) <> '' THEN
        PERFORM public.link_guest_orders(NEW.id, NEW.email);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_guest_orders_on_profile ON public.profiles;
CREATE TRIGGER trg_link_guest_orders_on_profile
    AFTER INSERT OR UPDATE OF email ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_order_linking();
