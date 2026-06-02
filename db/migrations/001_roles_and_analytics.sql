-- ============================================================================
-- Migration 001 — Roles, Analytics & Audit
-- ----------------------------------------------------------------------------
-- REVIEW-READY, NOT YET APPLIED. Apply manually after review:
--   psql "$DATABASE_URL" -f db/migrations/001_roles_and_analytics.sql
-- (or paste into the Supabase SQL editor).
--
-- Safe to run more than once: every statement is IF NOT EXISTS / idempotent.
-- ============================================================================

-- ─── 1. Roles ────────────────────────────────────────────────────────────────
-- Today access is all-or-nothing via users.is_admin. Introduce a real role so
-- staff can manage orders/products WITHOUT seeing revenue, analytics or the
-- team/role management. is_admin is kept for backward compatibility.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'staff';

-- Allowed roles (drop & recreate so re-running stays clean).
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'admin', 'staff', 'viewer'));

-- Backfill: every current admin becomes at least 'admin'.
UPDATE users SET role = 'admin' WHERE is_admin = 1 AND role = 'staff';

-- Promote the shop owner. EDIT the email, then uncomment:
-- UPDATE users SET role = 'owner', is_admin = 1 WHERE email = 'admin@norevan.shop';

-- ─── 2. Page views (privacy-friendly analytics) ──────────────────────────────
-- No raw IPs, no personal data. Country comes from an edge geo header, the
-- session id is an anonymous random token kept client-side.
CREATE TABLE IF NOT EXISTS page_views (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path        text        NOT NULL,
  country     text,                       -- ISO-3166 alpha-2, e.g. 'DE'
  referrer    text,                       -- 'direct' | host | utm source
  device      text,                       -- 'mobile' | 'desktop' | 'tablet'
  session_id  text,                       -- anonymous, rotates per visit
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx       ON page_views (path);
CREATE INDEX IF NOT EXISTS page_views_country_idx    ON page_views (country);
CREATE INDEX IF NOT EXISTS page_views_session_idx    ON page_views (session_id);

-- Retention helper: aggregate/delete rows older than 180 days (run via cron).
-- DELETE FROM page_views WHERE created_at < now() - interval '180 days';

-- ─── 3. Admin audit log ──────────────────────────────────────────────────────
-- Who changed what in the back office (order status, product, role, …).
CREATE TABLE IF NOT EXISTS admin_audit (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    integer REFERENCES users(id) ON DELETE SET NULL,
  action      text        NOT NULL,       -- 'order.status', 'product.update', 'role.change', …
  target      text,                       -- order id / product slug / user email
  meta        jsonb,                      -- before/after, extra context
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_created_at_idx ON admin_audit (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_actor_idx      ON admin_audit (actor_id);

-- ─── 4. Row Level Security ───────────────────────────────────────────────────
-- The backend connects via the Postgres connection string and bypasses RLS.
-- Both tables are written/read SERVER-SIDE only, so we enable RLS and add NO
-- policies → the public API (anon/authenticated) can neither read nor write.
-- This keeps analytics tamper-proof (page_views can't be spammed via the API).
ALTER TABLE page_views  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS page_views_insert ON page_views;

