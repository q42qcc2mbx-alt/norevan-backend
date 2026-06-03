// Server-only newsletter data layer. Reads the subscriber list via the Supabase
// service-role key (bypasses RLS) — never import this into a client component.
import "server-only";
import { createClient } from "@supabase/supabase-js";

export type Subscriber = {
  email: string;
  subscribedAt: string;
  unsubscribed: boolean;
  source: string | null;
};

function serviceClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

/** All subscribers, newest first. Returns [] on any error (e.g. table missing). */
export async function getSubscribers(limit = 1000): Promise<Subscriber[]> {
  try {
    const { data, error } = await serviceClient()
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
