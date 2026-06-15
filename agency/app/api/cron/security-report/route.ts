import { NextResponse } from "next/server";
import { SUPABASE_URL } from "@/lib/supabase";
import { runAudit, summariseSecurity } from "@/lib/audit";
import { sendSecurityReport } from "@/lib/email";

// Monthly security report for real customers (people with an agency_projects
// row). For each, we scan their live website, derive an honest A–D security
// grade, deliver it as a portal message AND e-mail. Triggered by Vercel Cron
// (see vercel.json). Protected by CRON_SECRET; needs SUPABASE_SERVICE_ROLE_KEY
// for cross-table reads/writes. Without those (or RESEND_*) it safely no-ops.

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX = 12;
const URL_RE = /https?:\/\/[^\s"'<>]+/i;

function buildMessage(
  website: string,
  grade: string,
  protectedTitles: string[],
  issues: { title: string; detail: string }[],
): string {
  const head = `🛡 Ihr monatlicher Sicherheits-Report für ${website}\nSicherheits-Note: ${grade}`;
  const prot = protectedTitles.length
    ? `\n\nAktiv geschützt:\n` + protectedTitles.map((t) => `✓ ${t}`).join("\n")
    : "";
  const probs = issues.length
    ? `\n\nHandlungsbedarf:\n` + issues.map((i) => `⚠ ${i.title} — ${i.detail}`).join("\n") +
      `\n\nGern beheben wir diese Punkte für Sie — antworten Sie einfach hier oder über das Kontaktformular.`
    : `\n\nKeine Schwachstellen gefunden — Ihre Website ist sicher aufgestellt. 🎉`;
  return head + prot + probs;
}

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
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  let scanned = 0;
  let sent = 0;
  const seen = new Set<string>();

  try {
    const projRes = await fetch(
      `${SUPABASE_URL}/rest/v1/agency_projects?select=email,user_id,title,notes&email=not.is.null&limit=50`,
      { headers },
    );
    if (!projRes.ok) {
      return NextResponse.json({ ok: true, scanned: 0, sent: 0 });
    }
    const projects = (await projRes.json()) as {
      email?: string;
      user_id?: string | null;
      title?: string;
      notes?: string;
    }[];

    for (const p of projects) {
      if (scanned >= MAX) break;
      const email = (p.email ?? "").trim().toLowerCase();
      if (!email || seen.has(email)) continue;

      // Find the website: in the project title/notes, else the latest analysis.
      let website = p.title?.match(URL_RE)?.[0] ?? p.notes?.match(URL_RE)?.[0] ?? "";
      if (!website) {
        const aRes = await fetch(
          `${SUPABASE_URL}/rest/v1/agency_analyses?select=website&email=eq.${encodeURIComponent(email)}&website=not.is.null&order=created_at.desc&limit=1`,
          { headers },
        );
        if (aRes.ok) {
          const rows = (await aRes.json()) as { website?: string }[];
          website = rows[0]?.website ?? "";
        }
      }
      if (!website) continue;

      seen.add(email);
      scanned++;

      try {
        const audit = await runAudit(website, { deep: true });
        const { grade, protectedTitles, issues } = summariseSecurity(audit.findings);

        // Portal message (shows up in the customer's "Nachrichten").
        await fetch(`${SUPABASE_URL}/rest/v1/agency_messages`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({
            email,
            user_id: p.user_id ?? null,
            sender: "team",
            content: buildMessage(audit.url, grade, protectedTitles, issues),
            read: false,
          }),
        }).catch(() => {});

        const r = await sendSecurityReport(email, {
          website: audit.url,
          grade,
          protectedTitles,
          issues: issues.map((i) => ({ title: i.title, detail: i.detail })),
        });
        if (r.sent) sent++;
      } catch (e) {
        console.error("security-report failed for", website, e);
      }
    }
  } catch (e) {
    console.error("security-report cron error", e);
  }

  return NextResponse.json({ ok: true, scanned, sent });
}
