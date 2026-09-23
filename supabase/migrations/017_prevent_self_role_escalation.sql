-- ==============================================================================
-- PHILZ SIGNATURE — 017_prevent_self_role_escalation.sql
-- Close a privilege-escalation gap found while auditing service-role usage:
-- "Users can update own profile" (auth.uid() = id) has no column-level
-- restriction, so ANY authenticated user - including a brand-new customer -
-- could call supabase.from('profiles').update({ role: 'super_admin' })
-- .eq('id', theirOwnId) directly from the browser and grant themselves
-- Super Admin. RLS policies are row-level only; a trigger is needed to
-- enforce the column-level rule that a user cannot change their own role
-- or active status unless they are already an admin (or the request comes
-- from a server-side service-role client, e.g. our webhook/admin endpoints).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.id = auth.uid()
       AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active)
    THEN
        IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
            RAISE EXCEPTION 'You cannot change your own role or active status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_self_role_escalation();
