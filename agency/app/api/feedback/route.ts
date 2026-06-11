import { NextResponse } from "next/server";
import { insertRow } from "@/lib/db";
import { clean, clientIp, EMAIL_RE, isBot, rateLimited } from "@/lib/security";

export const runtime = "nodejs";

const TYPES = new Set(["fehler", "vorschlag", "bewertung"]);

export async function POST(req: Request) {
  if (rateLimited("feedback", clientIp(req), 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 });
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Bots get a fake success.
  if (isBot(body)) return NextResponse.json({ ok: true });

  const typ = clean(body?.typ, 20);
  const message = clean(body?.message, 3000);
  const email = clean(body?.email, 200);
  const ratingRaw = Number(body?.rating);
  const rating =
    typ === "bewertung" && Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
      ? ratingRaw
      : null;

  if (!TYPES.has(typ) || !message) {
    return NextResponse.json({ error: "Bitte füllen Sie alle Pflichtfelder aus." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse." }, { status: 400 });
  }

  insertRow("agency_feedback", { typ, rating, email: email || null, message });

  return NextResponse.json({ ok: true });
}
