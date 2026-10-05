-- ==============================================================================
-- PHILZ SIGNATURE — 032_smtp_settings.sql
-- SMTP / Email Delivery Settings (super_admin only), encrypted credentials
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.smtp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL DEFAULT 'Custom',
    smtp_host TEXT,
    smtp_port INTEGER NOT NULL DEFAULT 465,
    smtp_username TEXT,
    smtp_password_encrypted TEXT,
    smtp_from_name TEXT,
    smtp_from_email TEXT,
    smtp_secure BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Single-row configuration table: enforce at most one row application-side via a
-- fixed well-known id so upserts always target the same record.
INSERT INTO public.smtp_settings (id, provider_name)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Custom')
ON CONFLICT (id) DO NOTHING;

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_smtp_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_smtp_settings_updated_at ON public.smtp_settings;
CREATE TRIGGER trigger_update_smtp_settings_updated_at
BEFORE UPDATE ON public.smtp_settings
FOR EACH ROW
EXECUTE FUNCTION update_smtp_settings_updated_at();

-- Enable Row Level Security
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin select on smtp_settings" ON public.smtp_settings;
DROP POLICY IF EXISTS "Super admin update on smtp_settings" ON public.smtp_settings;
DROP POLICY IF EXISTS "Super admin insert on smtp_settings" ON public.smtp_settings;
DROP POLICY IF EXISTS "Super admin delete on smtp_settings" ON public.smtp_settings;

-- SELECT: super_admin only
CREATE POLICY "Super admin select on smtp_settings"
ON public.smtp_settings
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
);

-- UPDATE: super_admin only
CREATE POLICY "Super admin update on smtp_settings"
ON public.smtp_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
);

-- INSERT: super_admin only
CREATE POLICY "Super admin insert on smtp_settings"
ON public.smtp_settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
);

-- DELETE: super_admin only
CREATE POLICY "Super admin delete on smtp_settings"
ON public.smtp_settings
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
);
