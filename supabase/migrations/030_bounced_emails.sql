-- ==============================================================================
-- PHILZ SIGNATURE — 030_bounced_emails.sql
-- Tracks hard-bounced recipient addresses so we never send to them again
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bounced_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    reason TEXT,
    bounced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bounced_emails_email ON public.bounced_emails(email);

ALTER TABLE public.bounced_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin and super_admin read access to bounced_emails" ON public.bounced_emails;
CREATE POLICY "Allow admin and super_admin read access to bounced_emails"
ON public.bounced_emails
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'administrator')
        AND is_active = true
    )
);
