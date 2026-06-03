-- ============================================================================
-- Migration 010 — Abandoned-checkout reminders
-- ----------------------------------------------------------------------------
-- An order that was created but never paid (status = 'pending') is an abandoned
-- checkout. A scheduled task emails a one-time reminder; reminder_sent_at marks
-- the row so we never send twice. Idempotent.
--
--   psql "$DATABASE_URL" -f db/migrations/010_abandoned_cart.sql
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
