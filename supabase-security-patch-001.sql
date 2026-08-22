-- ============================================================================
-- SHOWY — SECURITY PATCH 001
-- Privilege-Escalation Guard + Admin Audit Log
--
-- HOW TO APPLY:
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run
--   Idempotent: safe to run multiple times.
--
-- WHY THIS EXISTS:
--   RLS is ROW-level only. The "profiles_update_own_basic" policy correctly
--   lets users edit their own profile row (name/phone/avatar), but it also
--   allowed them to set role = 'admin' on their own row — a full privilege-
--   escalation hole. This patch adds column guarding via trigger and an
--   append-only audit trail for sensitive admin actions.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) GUARD: block non-admins from changing protected profile columns.
--    Users may still edit their own full_name / phone / avatar_url freely.
--    Admins pass through untouched.
--    auth.uid() IS NULL = SQL Editor / service-role maintenance → allowed,
--    so your documented first-admin bootstrap keeps working:
--      UPDATE public.profiles SET role='admin' WHERE email='you@example.com';
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Maintenance context (SQL editor / service_role): allow.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Real admins may change anything.
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Permission denied: role cannot be changed by users.';
  END IF;

  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Permission denied: email cannot be changed here.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_privileges ON public.profiles;
CREATE TRIGGER trg_guard_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileges();

-- ---------------------------------------------------------------------------
-- 2) ADMIN AUDIT LOG (append-only foundation)
--    • Admins can read. Nobody can UPDATE or DELETE via client APIs.
--    • Writes happen through SECURITY DEFINER helpers/triggers only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,              -- e.g. 'profile.role_changed'
  target_type TEXT,                       -- e.g. 'profile' | 'payout'
  target_id   TEXT,
  details     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read_only" ON public.admin_audit_logs;
CREATE POLICY "audit_admin_read_only" ON public.admin_audit_logs
  FOR SELECT USING (public.is_admin());

-- Intentionally NO insert/update/delete policies: client inserts are blocked;
-- only definer functions below can write.

-- Generic helper future features (M5) will call from admin UI flows.
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action      TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id   TEXT DEFAULT NULL,
  p_details     JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can write audit entries.';
  END IF;
  INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
END;
$$;

-- Auto-audit every role change (who promoted/demoted whom, old→new).
-- Runs AFTER the guard, so a logged row here always means a permitted change.
CREATE OR REPLACE FUNCTION public.audit_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, details)
    VALUES (
      CASE WHEN public.is_admin() AND auth.uid() IS NOT NULL THEN auth.uid() ELSE NULL END,
      'profile.role_changed',
      'profile',
      NEW.id::TEXT,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role,
                         'via', CASE WHEN auth.uid() IS NULL THEN 'sql_editor/service_role' ELSE 'app' END)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_profile_role ON public.profiles;
CREATE TRIGGER trg_audit_profile_role
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_role_change();

-- ============================================================================
-- VERIFICATION (run after applying):
--   As a normal logged-in user this should FAIL with our exception:
--     UPDATE public.profiles SET role='admin' WHERE id = auth.uid();
--   This should SUCCEED and log an entry (run as yourself in SQL editor):
--     SELECT * FROM public.admin_audit_logs ORDER BY created_at DESC LIMIT 5;
-- ============================================================================
