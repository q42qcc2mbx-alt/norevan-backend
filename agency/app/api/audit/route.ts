import { NextResponse } from "next/server";
import { runAudit } from "@/lib/audit";

export const runtime = "nodejs";

// Naive in-memory rate limit: 10 audits per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 },
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url || url.length > 300) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige Website-URL an." },
      { status: 400 },
    );
  }

  try {
    const result = await runAudit(url);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Die Website hat zu langsam geantwortet. Genau dafür sind wir da — senden Sie uns eine Anfrage."
        : err instanceof Error && err.message.includes("analysiert")
          ? err.message
          : "Die Website konnte nicht erreicht werden. Prüfen Sie die URL oder kontaktieren Sie uns direkt.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
