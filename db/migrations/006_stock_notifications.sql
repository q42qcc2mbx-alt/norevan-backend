-- ============================================================================
-- Migration 006 — Back-in-stock notifications
-- ----------------------------------------------------------------------------
-- Visitors of a sold-out product can leave an email; when stock returns we
-- notify them once. Backend-managed (RLS on, no public policies).
--
--   psql "$DATABASE_URL" -f db/migrations/006_stock_notifications.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_notifications (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_slug text        NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  email        text        NOT NULL,
  notified     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_slug, email)
);

CREATE INDEX IF NOT EXISTS stock_notifications_pending_idx
  ON stock_notifications (product_slug) WHERE notified = false;

ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
