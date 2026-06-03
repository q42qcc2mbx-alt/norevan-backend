-- ============================================================================
-- Migration 012 — Stripe customer link (saved payment methods)
-- ----------------------------------------------------------------------------
-- We never store card data ourselves (PCI). Instead each customer maps to a
-- Stripe Customer; passing it to Checkout lets Stripe save the card to that
-- customer and show it again on the next purchase (one-click). We only keep
-- the opaque Stripe customer id here.
-- Idempotent.
--
--   psql "$DATABASE_URL" -f db/migrations/012_stripe_customer.sql
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
