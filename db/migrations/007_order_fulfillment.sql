-- ============================================================================
-- Migration 007 — Order fulfilment details
-- ----------------------------------------------------------------------------
-- Adds shipping tracking (carrier + number) and an internal, customer-invisible
-- note to each order. Backend-managed (pg bypasses RLS); orders already have
-- RLS handled by earlier migrations. Every statement is idempotent.
--
--   psql "$DATABASE_URL" -f db/migrations/007_order_fulfillment.sql
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier         text;
-- Internal note — visible only in the back office, never sent to the customer.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes           text;
