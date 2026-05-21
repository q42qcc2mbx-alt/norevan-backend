import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient stores the session in cookies (not localStorage),
// which makes it readable by the Next.js middleware for server-side auth checks.
export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
