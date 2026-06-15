import { SUPABASE_URL, SUPABASE_KEY } from "./supabase";

/**
 * Server-side insert via PostgREST. Uses the publishable key — the agency_*
 * tables have RLS insert policies for public form submissions.
 * Failures are logged but never thrown: storage must not break the UX.
 */
export async function insertRow(table: string, row: Record<string, unknown>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.error(`Supabase insert into ${table} failed:`, res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error(`Supabase insert into ${table} errored:`, err);
    return false;
  }
}

/**
 * Call a Postgres RPC (SECURITY DEFINER function) via PostgREST. Used for the
 * token-scoped inquiry chat so anonymous visitors only ever touch their own
 * conversation. Returns the parsed result or null on failure.
 */
export async function callRpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      console.error(`Supabase rpc ${fn} failed:`, res.status, await res.text());
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Supabase rpc ${fn} errored:`, err);
    return null;
  }
}
