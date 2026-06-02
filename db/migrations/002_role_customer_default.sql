-- ============================================================================
-- Migration 002 — Safe default role
-- ----------------------------------------------------------------------------
-- 001 defaulted users.role to 'staff'. But /auth/register is PUBLIC, so a
-- self-registered account would gain back-office (staff) access the moment the
-- admin area is opened to staff. Privileged roles must be granted explicitly.
--
-- New model (least → most power):
--   customer  — normal account, NO back-office access (default)
--   viewer    — read-only back office
--   staff     — manage orders & products (no revenue/analytics/team)
--   admin     — + revenue & analytics
--   owner     — + team & role management
--
-- Idempotent. Apply with:
--   psql "$DATABASE_URL" -f db/migrations/002_role_customer_default.sql
-- ============================================================================

-- Allow 'customer' and make it the default.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'viewer', 'staff', 'admin', 'owner'));

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';

-- Reclassify accounts that only became 'staff' via the 001 backfill default.
-- (No deliberate staff exist yet; real staff are granted explicitly later.)
UPDATE users SET role = 'customer' WHERE is_admin = 0 AND role = 'staff';
