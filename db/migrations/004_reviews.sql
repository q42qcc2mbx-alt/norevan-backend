-- ============================================================================
-- Migration 004 — Product reviews
-- ----------------------------------------------------------------------------
-- Read/written server-side via the Express backend (pg bypasses RLS). RLS is
-- enabled with no public policies so the table can't be touched directly
-- through the public API.
--
-- Idempotent. Apply with:
--   psql "$DATABASE_URL" -f db/migrations/004_reviews.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_slug text        NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  author_id    uuid,                       -- auth.users id
  author_name  text,
  rating       int         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         text,
  verified     boolean     NOT NULL DEFAULT false,  -- bought this product
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_slug, author_id)
);

CREATE INDEX IF NOT EXISTS reviews_slug_idx ON reviews (product_slug, created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
