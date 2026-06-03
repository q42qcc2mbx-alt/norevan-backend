import { api } from "@/lib/api/client";
import { getSupabaseAccessToken } from "@/lib/supabase/server";

// Triggers the backend welcome email for the current Supabase user. The backend
// sends it at most once per customer (profiles.welcomed_at guard), so it's safe
// to call on every login. Best-effort: always 204. The access token may be sent
// in the body (right after a client login) or read from the session cookie.
export async function POST(request: Request) {
  try {
    let token: string | null = null;
    try {
      const body = (await request.json()) as { access_token?: string };
      token = body?.access_token ?? null;
    } catch {
      // no/invalid body — fall back to the session cookie
    }
    if (!token) token = await getSupabaseAccessToken();

    if (token) {
      await api.post("/account/welcome", undefined, { token });
    }
  } catch {
    // never surface errors to the client
  }
  return new Response(null, { status: 204 });
}
