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
