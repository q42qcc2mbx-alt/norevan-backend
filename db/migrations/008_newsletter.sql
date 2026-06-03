-- ============================================================================
-- Migration 008 — Newsletter subscribers
-- ----------------------------------------------------------------------------
-- The shop's NewsletterSection posts to /api/newsletter, which upserts into
-- this table via the Supabase service-role key. RLS is ON with NO policies, so
-- the public anon/authenticated API can neither read nor list subscribers — the
-- service role (server-side) and the Postgres connection bypass RLS.
--
--   psql "$DATABASE_URL" -f db/migrations/008_newsletter.sql
--   (or paste into the Supabase SQL editor)
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email         text        PRIMARY KEY,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  -- Soft unsubscribe — keep the row for suppression, stop sending.
  unsubscribed  boolean     NOT NULL DEFAULT false,
  source        text                                   -- 'footer' | 'checkout' | …
);

CREATE INDEX IF NOT EXISTS newsletter_subscribed_at_idx
  ON newsletter_subscribers (subscribed_at DESC);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
