-- ============================================================================
-- Migration 013 — Security hardening (from the Supabase security advisor)
-- ----------------------------------------------------------------------------
-- 1. CRITICAL: newsletter_subscribers had a policy granting the `public` role
--    full ALL access (USING/ WITH CHECK = true). With the public anon key that
--    let anyone read/modify/delete every subscriber email via the REST API.
--    Newsletter writes go through the service-role key (bypasses RLS), so no
--    policy is needed — dropping it denies the public API entirely.
-- 2. The auth-signup trigger function must not be directly callable via RPC.
-- 3. Pin the updated-at trigger function's search_path (advisor WARN).
-- Idempotent.
--
--   psql "$DATABASE_URL" -f db/migrations/013_security_hardening.sql
-- ============================================================================

DROP POLICY IF EXISTS service_role_all ON public.newsletter_subscribers;

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated, public;

ALTER FUNCTION public.set_updated_at() SET search_path = '';
