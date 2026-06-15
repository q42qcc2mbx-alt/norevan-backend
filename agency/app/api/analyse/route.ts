import { NextResponse } from "next/server";
import { runAnalyse } from "@/lib/analyse";
import { insertRow } from "@/lib/db";
import { isBot } from "@/lib/security";

export const runtime = "nodejs";

// Naive in-memory rate limit: 8 analyses per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 },
    );
  }

  let body: { name?: string; email?: string; url?: string; goal?: string; userId?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Bots that fill the hidden honeypot field get a fake error (no audit run).
  if (isBot(body as Record<string, unknown>)) {
    return NextResponse.json({ error: "Die Website konnte nicht erreicht werden." }, { status: 422 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const url = body.url?.trim() ?? "";
  const goal = body.goal?.trim() ?? "";

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Bitte geben Sie Ihren Namen an." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige E-Mail-Adresse an." },
      { status: 400 },
    );
  }
  if (!url || url.length > 300 || goal.length > 2000) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige Website-URL an." },
      { status: 400 },
    );
  }

  try {
    const result = await runAnalyse(url, goal);

    // Persist for the team dashboard and the customer's account. Awaited: on
    // serverless an un-awaited insert is dropped when the function returns.
    await insertRow("agency_analyses", {
      name,
      email,
      website: result.url,
      goal,
      score: result.score,
      // Drop the (large) screenshot before persisting — keep the metrics.
      result: { ...result, screenshot: undefined },
      user_id: body.userId || null,
    });

    const webhook = process.env.LEAD_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "analyse", name, email, website: result.url, goal, score: result.score }),
      }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (err) {
    // Even when the site can't be analysed, keep the lead.
    await insertRow("agency_leads", { name, email, website: url, message: goal, source: "analyse_fehlgeschlagen" });
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Die Website hat zu langsam geantwortet. Genau dafür sind wir da — wir melden uns bei Ihnen."
        : err instanceof Error && err.message.includes("analysiert")
          ? err.message
          : "Die Website konnte nicht erreicht werden. Wir haben Ihre Anfrage gespeichert und melden uns persönlich.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
