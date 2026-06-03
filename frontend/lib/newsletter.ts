// Server-only newsletter data layer. Reads the subscriber list via the Supabase
// service-role key (bypasses RLS) — never import this into a client component.
// The table is locked to the public API (no RLS policy), so the anon key cannot
// read it: SUPABASE_SERVICE_ROLE_KEY is required.
import "server-only";
import { createClient } from "@supabase/supabase-js";

export type Subscriber = {
  email: string;
  subscribedAt: string;
  unsubscribed: boolean;
  source: string | null;
};

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null; // never fall back to the anon key for privileged reads
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

/** All subscribers, newest first. Returns [] on any error (e.g. table missing). */
export async function getSubscribers(limit = 1000): Promise<Subscriber[]> {
  const client = serviceClient();
  if (!client) {
    console.warn("[newsletter] SUPABASE_SERVICE_ROLE_KEY missing — cannot read subscribers");
    return [];
  }
  try {
    const { data, error } = await client
      .from("newsletter_subscribers")
      .select("email, subscribed_at, unsubscribed, source")
      .order("subscribed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      email: r.email,
      subscribedAt: r.subscribed_at,
      unsubscribed: !!r.unsubscribed,
      source: r.source ?? null,
    }));
  } catch (err) {
    console.warn("[newsletter] getSubscribers failed:", (err as Error).message);
    return [];
  }
}
