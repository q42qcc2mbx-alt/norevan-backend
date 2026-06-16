import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Publishable key — safe to ship to the browser; row access is enforced by RLS.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://akzuhdogmzefszoredcj.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_zgnlFBQTR-uXn0CxhiAjaQ_zxYbSlaa";

let browserClient: SupabaseClient | null = null;

/** Browser-side singleton (auth session persisted in localStorage). */
export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return browserClient;
}

export type ProjectStatus = "analyse" | "planung" | "entwicklung" | "testing" | "fertig";

export const PROJECT_STEPS: { key: ProjectStatus; label: string }[] = [
  { key: "analyse", label: "Analyse" },
  { key: "planung", label: "Planung" },
  { key: "entwicklung", label: "Entwicklung" },
  { key: "testing", label: "Testing" },
  { key: "fertig", label: "Fertig" },
];
