-- ============================================================================
-- Migration 003 — Customer shipping address on profiles
-- ----------------------------------------------------------------------------
-- profiles.id = auth.users.id. RLS already allows each user to read/update
-- their OWN row (profiles_select_own / profiles_update_own), so the address
-- form can write directly via supabase-js — no backend endpoint needed.
--
-- Idempotent. Apply with:
--   psql "$DATABASE_URL" -f db/migrations/003_profile_address.sql
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip        text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country    text;
-- phone already exists on profiles.
