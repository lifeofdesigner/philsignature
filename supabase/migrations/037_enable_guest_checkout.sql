-- ==============================================================================
-- 037_enable_guest_checkout.sql
-- Forces guest_checkout = 'enabled' in site_settings so DB matches code.
-- ==============================================================================

INSERT INTO public.site_settings (key, value, description, created_at, updated_at)
VALUES (
    'guest_checkout',
    '"enabled"'::jsonb,
    'Allow customers to complete purchases without creating an account',
    NOW(),
    NOW()
)
ON CONFLICT (key) DO UPDATE
    SET value      = '"enabled"'::jsonb,
        updated_at = NOW();
