import { NextResponse } from "next/server";
import { runAudit, type AuditResult } from "@/lib/audit";
import { sendAuditReport } from "@/lib/email";
import { insertRow } from "@/lib/db";
import { clientIp, rateLimited, isBot, clean, EMAIL_RE } from "@/lib/security";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

/** Trust a client-provided scan only if it is well-formed; else re-run. */
function isValidScan(scan: unknown): scan is AuditResult {
  if (!scan || typeof scan !== "object") return false;
  const s = scan as Record<string, unknown>;
  return (
    typeof s.url === "string" &&
    typeof s.score === "number" &&
    Array.isArray(s.findings)
  );
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (rateLimited("lead", ip, MAX_PER_WINDOW, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 },
    );
  }

  let body: { url?: string; email?: string; consent?: boolean; company?: string; scan?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Honeypot: bots filling the hidden field get a generic error, no work done.
  if (isBot(body as Record<string, unknown>)) {
    return NextResponse.json({ error: "Anfrage konnte nicht verarbeitet werden." }, { status: 422 });
  }

  const email = clean(body.email, 200);
  const url = clean(body.url, 300);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige E-Mail-Adresse an." },
      { status: 400 },
    );
  }
  if (!url) {
    return NextResponse.json({ error: "Es fehlt die Website-Adresse." }, { status: 400 });
  }
  // DSGVO: ohne ausdrückliche Einwilligung speichern/versenden wir nichts.
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Bitte bestätigen Sie, dass wir Ihnen den Report senden dürfen." },
      { status: 400 },
    );
  }

  // Authoritative report: trust the fresh client scan, otherwise re-run.
  let audit: AuditResult;
  try {
    audit = isValidScan(body.scan) ? body.scan : await runAudit(url);
  } catch {
    // Even when the site can't be analysed, keep the lead so we can follow up.
    insertRow("agency_leads", {
      name: "(Funnel-Lead)",
      email,
      website: url,
      message: "Funnel-Audit fehlgeschlagen — Website nicht erreichbar.",
      source: "funnel_audit_failed",
    });
    return NextResponse.json(
      {
        error:
          "Wir konnten Ihre Website nicht automatisch scannen — kein Problem. Wir haben Ihre Anfrage erhalten und melden uns persönlich mit Ihrer Analyse.",
      },
      { status: 422 },
    );
  }

  const criticalCount = audit.findings.filter((f) => f.severity === "critical").length;

  // Persist for the team dashboard (consent metadata stored inside the result).
  insertRow("agency_analyses", {
    name: "(Funnel-Lead)",
    email,
    website: audit.url,
    goal: "Lead-Magnet: kostenlose Website-Analyse",
    score: audit.score,
    result: { ...audit, lead: { source: "funnel", consentAt: new Date().toISOString() } },
    user_id: null,
  });

  // Notify the team in real time (fire & forget).
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "funnel_lead",
        email,
        website: audit.url,
        score: audit.score,
        criticalCount,
      }),
    }).catch(() => {});
  }

  // Deliver the report. Best-effort: if email isn't configured, the lead is
  // still captured and the team got notified above.
  const { sent } = await sendAuditReport(email, audit);

  return NextResponse.json({ ok: true, emailed: sent, score: audit.score, criticalCount });
}
