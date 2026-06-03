-- ============================================================================
-- Migration 011 — Invoices + welcome-email marker
-- ----------------------------------------------------------------------------
-- * invoice_number: human-facing, sequential invoice id (§14 UStG). Assigned
--   once, when an order becomes 'paid'. Format e.g. NOR-2026-01000.
-- * invoice_seq:    the gapless source for that number.
-- * profiles.welcomed_at: set the first time we send the welcome email, so it
--   goes out exactly once per customer.
-- Idempotent.
--
--   psql "$DATABASE_URL" -f db/migrations/011_invoices_welcome.sql
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1000;
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS invoice_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcomed_at timestamptz;
