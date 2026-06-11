import { NextResponse } from "next/server";
import { insertRow } from "@/lib/db";
import { clientIp, isBot, rateLimited } from "@/lib/security";

export const runtime = "nodejs";

interface ContactPayload {
  name?: string;
  email?: string;
  website?: string;
  message?: string;
  company?: string; // honeypot
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (rateLimited("contact", clientIp(req), 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 },
    );
  }

  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Bots that fill the hidden honeypot field get a fake success.
  if (isBot(body as Record<string, unknown>)) {
    return NextResponse.json({ ok: true, message: "Vielen Dank!" });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const website = body.website?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Bitte geben Sie Ihren Namen an." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige E-Mail-Adresse an." },
      { status: 400 },
    );
  }
  if (message.length > 5000 || website.length > 300) {
    return NextResponse.json({ error: "Eingabe zu lang." }, { status: 400 });
  }

  const lead = {
    name,
    email,
    website,
    message,
    receivedAt: new Date().toISOString(),
  };

  // Persist for the team dashboard (fire & forget — must not break the UX).
  insertRow("agency_leads", { name, email, website, message, source: "kontakt" });

  // Forward to a webhook (Slack, n8n, Zapier, CRM …) if configured,
  // otherwise the lead is at least visible in the server logs.
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      console.error("Lead webhook delivery failed:", err);
    }
  }
  console.log("New lead received:", JSON.stringify(lead));

  return NextResponse.json({
    ok: true,
    message:
      "Vielen Dank! Ihre Anfrage ist eingegangen — wir melden uns innerhalb von 24 Stunden bei Ihnen.",
  });
}
