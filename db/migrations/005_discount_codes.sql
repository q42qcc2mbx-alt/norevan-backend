-- ============================================================================
-- Migration 005 — Discount codes
-- ----------------------------------------------------------------------------
-- Backend-managed (pg bypasses RLS). Orders gain discount fields; subtotal_cents
-- stores the NET amount charged (gross items minus discount) so revenue stays
-- accurate, with discount_cents kept for the record.
--
--   psql "$DATABASE_URL" -f db/migrations/005_discount_codes.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_codes (
  code               text        PRIMARY KEY,
  type               text        NOT NULL CHECK (type IN ('percent', 'fixed')),
  value              int         NOT NULL CHECK (value > 0),   -- percent (1-100) or cents
  active             boolean     NOT NULL DEFAULT true,
  min_subtotal_cents int         NOT NULL DEFAULT 0,
  max_uses           int,                                      -- null = unlimited
  used_count         int         NOT NULL DEFAULT 0,
  expires_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_cents int NOT NULL DEFAULT 0;
