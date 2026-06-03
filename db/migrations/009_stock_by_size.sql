-- ============================================================================
-- Migration 009 — Per-size stock
-- ----------------------------------------------------------------------------
-- Adds optional per-size inventory. `stock_by_size` is a JSON map of size →
-- units, e.g. {"S": 3, "M": 0, "L": 5}. When present it is the source of truth
-- and the aggregate `stock` column is kept in sync (= sum of sizes) so existing
-- low-stock / sold-out logic keeps working. When NULL the product uses the old
-- single-field `stock` (fully backward compatible). Idempotent.
--
--   psql "$DATABASE_URL" -f db/migrations/009_stock_by_size.sql
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_by_size JSONB;
