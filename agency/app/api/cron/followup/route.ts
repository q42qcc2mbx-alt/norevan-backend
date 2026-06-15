import { NextResponse } from "next/server";
import { SUPABASE_URL } from "@/lib/supabase";
import { sendFollowUpEmail } from "@/lib/email";

// Daily follow-up nudge for leads that went quiet (>24h, not yet followed up).
// Triggered by Vercel Cron (see vercel.json). Protected by CRON_SECRET. Needs a
// server-only SUPABASE_SERVICE_ROLE_KEY for cross-table reads/updates; without
// it (or without RESEND_*) it safely no-ops.

export const runtime = "nodejs";
export const maxDuration = 60;

const TABLES = ["agency_leads", "agency_analyses", "agency_conversations"];
const MAX_TOTAL = 30;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ ok: true, skipped: "SUPABASE_SERVICE_ROLE_KEY not set" });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  const seen = new Set<string>();
  let sent = 0;
  let processed = 0;

  const mark = (table: string, id: string) =>
    fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ follow_up_at: new Date().toISOString() }),
    }).catch(() => {});

  for (const table of TABLES) {
    if (processed >= MAX_TOTAL) break;
    try {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=id,name,email&follow_up_at=is.null&created_at=lt.${encodeURIComponent(cutoff)}&email=not.is.null&limit=20`;
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const rows = (await res.json()) as { id: string; name?: string; email?: string }[];
      for (const r of rows) {
        if (processed >= MAX_TOTAL) break;
        const email = (r.email ?? "").trim().toLowerCase();
        if (!email || seen.has(email)) {
          await mark(table, r.id); // skip permanently (dup / invalid)
          continue;
        }
        seen.add(email);
        processed++;
        const name = r.name && r.name !== "(Funnel-Lead)" ? r.name : undefined;
        const { sent: ok } = await sendFollowUpEmail(email, name);
        if (ok) {
          await mark(table, r.id);
          sent++;
        }
        // If not sent (e.g. RESEND not configured), leave follow_up_at null so
        // the lead is picked up again once e-mail sending is enabled.
      }
    } catch (e) {
      console.error("followup cron failed for", table, e);
    }
  }

  return NextResponse.json({ ok: true, sent, processed });
}
