-- ==============================================================================
-- PHILZ SIGNATURE — 025_auth_security_hardening.sql
-- Enterprise Authentication Security Hardening
-- 1. Track failed attempts & account lockouts
-- 2. IP & User-Agent audit logging on activity_logs
-- 3. Atomic functions for login failure, lockout detection, and login success
-- ==============================================================================

-- 1. Extend activity_logs for full IP & User-Agent audit trail
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 2. Create Auth Security Records table
CREATE TABLE IF NOT EXISTS public.auth_security_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    unlock_token TEXT,
    unlock_token_expires_at TIMESTAMPTZ,
    last_failed_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    last_login_user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_security_email ON public.auth_security_records(email);
CREATE INDEX IF NOT EXISTS idx_auth_security_locked ON public.auth_security_records(locked_until);

-- Enable RLS
ALTER TABLE public.auth_security_records ENABLE ROW LEVEL SECURITY;

-- Admins can view security records
DROP POLICY IF EXISTS "Admins view auth security records" ON public.auth_security_records;
CREATE POLICY "Admins view auth security records"
    ON public.auth_security_records FOR SELECT
    USING (is_admin());

-- Service role full access
DROP POLICY IF EXISTS "Service role manages auth security records" ON public.auth_security_records;
CREATE POLICY "Service role manages auth security records"
    ON public.auth_security_records FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Function: Check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
    v_is_locked BOOLEAN := false;
    v_remaining_seconds INT := 0;
BEGIN
    SELECT * INTO v_record
    FROM auth_security_records
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email));

    IF FOUND THEN
        IF v_record.locked_until IS NOT NULL AND v_record.locked_until > NOW() THEN
            v_is_locked := true;
            v_remaining_seconds := EXTRACT(EPOCH FROM (v_record.locked_until - NOW()))::INT;
        ELSIF v_record.locked_until IS NOT NULL AND v_record.locked_until <= NOW() THEN
            -- Lock has expired; reset failed attempts
            UPDATE auth_security_records
            SET failed_attempts = 0, locked_until = NULL, unlock_token = NULL
            WHERE id = v_record.id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'is_locked', v_is_locked,
        'remaining_seconds', v_remaining_seconds,
        'failed_attempts', COALESCE(v_record.failed_attempts, 0)
    );
END;
$$;

-- 4. Function: Record failed login attempt (locks out after 5 consecutive failures)
CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(
    p_email TEXT,
    p_ip TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
    v_new_attempts INT := 1;
    v_locked_until TIMESTAMPTZ := NULL;
    v_unlock_token TEXT := NULL;
    v_is_locked BOOLEAN := false;
BEGIN
    SELECT * INTO v_record
    FROM auth_security_records
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email));

    IF FOUND THEN
        -- If already locked, keep locked
        IF v_record.locked_until IS NOT NULL AND v_record.locked_until > NOW() THEN
            RETURN jsonb_build_object(
                'is_locked', true,
                'failed_attempts', v_record.failed_attempts,
                'remaining_seconds', EXTRACT(EPOCH FROM (v_record.locked_until - NOW()))::INT,
                'just_locked', false
            );
        END IF;

        v_new_attempts := v_record.failed_attempts + 1;
        IF v_new_attempts >= 5 THEN
            v_is_locked := true;
            -- Lock for 30 minutes
            v_locked_until := NOW() + INTERVAL '30 minutes';
            v_unlock_token := encode(gen_random_bytes(24), 'hex');
        END IF;

        UPDATE auth_security_records
        SET failed_attempts = v_new_attempts,
            locked_until = v_locked_until,
            unlock_token = v_unlock_token,
            unlock_token_expires_at = CASE WHEN v_is_locked THEN NOW() + INTERVAL '2 hours' ELSE NULL END,
            last_failed_at = NOW(),
            last_login_ip = COALESCE(p_ip, last_login_ip),
            last_login_user_agent = COALESCE(p_user_agent, last_login_user_agent),
            updated_at = NOW()
        WHERE id = v_record.id;
    ELSE
        INSERT INTO auth_security_records (
            email, failed_attempts, last_failed_at, last_login_ip, last_login_user_agent
        )
        VALUES (
            LOWER(TRIM(p_email)), 1, NOW(), p_ip, p_user_agent
        );
    END IF;

    -- Audit log
    INSERT INTO activity_logs (action, entity_type, entity_id, details, ip_address, user_agent)
    VALUES (
        CASE WHEN v_is_locked THEN 'AUTH_ACCOUNT_LOCKED' ELSE 'AUTH_FAILED_ATTEMPT' END,
        'auth_security',
        LOWER(TRIM(p_email)),
        jsonb_build_object('attempts', v_new_attempts, 'locked', v_is_locked),
        p_ip,
        p_user_agent
    );

    RETURN jsonb_build_object(
        'is_locked', v_is_locked,
        'failed_attempts', v_new_attempts,
        'just_locked', v_is_locked,
        'unlock_token', v_unlock_token
    );
END;
$$;

-- 5. Function: Record successful login (resets failures, detects new device/IP)
CREATE OR REPLACE FUNCTION public.record_successful_login(
    p_user_id UUID,
    p_email TEXT,
    p_ip TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
    v_is_new_device BOOLEAN := false;
    v_is_new_ip BOOLEAN := false;
BEGIN
    SELECT * INTO v_record
    FROM auth_security_records
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email));

    IF FOUND THEN
        IF v_record.last_login_user_agent IS NOT NULL AND p_user_agent IS NOT NULL AND v_record.last_login_user_agent <> p_user_agent THEN
            v_is_new_device := true;
        END IF;

        IF v_record.last_login_ip IS NOT NULL AND p_ip IS NOT NULL AND v_record.last_login_ip <> p_ip THEN
            v_is_new_ip := true;
        END IF;

        UPDATE auth_security_records
        SET user_id = p_user_id,
            failed_attempts = 0,
            locked_until = NULL,
            unlock_token = NULL,
            unlock_token_expires_at = NULL,
            last_login_at = NOW(),
            last_login_ip = COALESCE(p_ip, last_login_ip),
            last_login_user_agent = COALESCE(p_user_agent, last_login_user_agent),
            updated_at = NOW()
        WHERE id = v_record.id;
    ELSE
        INSERT INTO auth_security_records (
            user_id, email, failed_attempts, last_login_at, last_login_ip, last_login_user_agent
        )
        VALUES (
            p_user_id, LOWER(TRIM(p_email)), 0, NOW(), p_ip, p_user_agent
        );
    END IF;

    -- Audit log
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
    VALUES (
        p_user_id,
        'AUTH_LOGIN_SUCCESS',
        'profiles',
        p_user_id::text,
        jsonb_build_object(
            'email', p_email,
            'is_new_device', v_is_new_device,
            'is_new_ip', v_is_new_ip
        ),
        p_ip,
        p_user_agent
    );

    RETURN jsonb_build_object(
        'is_new_device', v_is_new_device,
        'is_new_ip', v_is_new_ip,
        'is_suspicious', (v_is_new_device OR v_is_new_ip)
    );
END;
$$;

-- 6. Function: Unlock account with token
CREATE OR REPLACE FUNCTION public.unlock_account_with_token(
    p_email TEXT,
    p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record
    FROM auth_security_records
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email))
      AND unlock_token = p_token
      AND unlock_token_expires_at > NOW();

    IF FOUND THEN
        UPDATE auth_security_records
        SET failed_attempts = 0,
            locked_until = NULL,
            unlock_token = NULL,
            unlock_token_expires_at = NULL,
            updated_at = NOW()
        WHERE id = v_record.id;

        INSERT INTO activity_logs (action, entity_type, entity_id, details)
        VALUES ('AUTH_ACCOUNT_UNLOCKED', 'auth_security', LOWER(TRIM(p_email)), jsonb_build_object('method', 'token'));

        RETURN true;
    END IF;

    RETURN false;
END;
$$;

NOTIFY pgrst, 'reload schema';
