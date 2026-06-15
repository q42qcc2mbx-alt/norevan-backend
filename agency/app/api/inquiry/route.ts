import { NextResponse } from "next/server";
import { callRpc } from "@/lib/db";
import { chatReply } from "@/lib/chat-ai";
import { sendTeamLeadNotification } from "@/lib/email";
import { clientIp, rateLimited, isBot, clean, EMAIL_RE } from "@/lib/security";

export const runtime = "nodejs";

// Create a new inquiry conversation: stores the lead, generates the first AI
// reply (which engages the prospect until an admin takes over), notifies the
// team. Returns a token the visitor uses to continue the chat.
export async function POST(req: Request) {
  if (rateLimited("inquiry", clientIp(req), 6, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (isBot(body)) {
    return NextResponse.json({ error: "Anfrage konnte nicht verarbeitet werden." }, { status: 422 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const website = clean(body.website, 300);
  const budget = clean(body.budget, 60);
  const message = clean(body.message, 4000);

  if (!name) return NextResponse.json({ error: "Bitte geben Sie Ihren Namen an." }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse an." }, { status: 400 });
  }
  if (!message) return NextResponse.json({ error: "Bitte beschreiben Sie kurz Ihr Anliegen." }, { status: 400 });

  const token = await callRpc<string>("inquiry_create", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_website: website,
    p_budget: budget,
    p_message: message,
  });
  if (!token) {
    return NextResponse.json({ error: "Anfrage konnte nicht gespeichert werden." }, { status: 500 });
  }

  // First AI reply — engage the prospect with their context.
  const ctx = [
    name && `Name: ${name}`,
    website && `Website: ${website}`,
    budget && `Budget: ${budget}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const reply = await chatReply(
    [{ role: "user", content: message }],
    `Eine neue Anfrage über das Formular. ${ctx}. Begrüße die Person mit Namen, gehe konkret auf ihr Anliegen ein, stelle ggf. EINE Rückfrage und sage, dass sich ein Mitglied des Teams persönlich meldet.`,
  );
  await callRpc("inquiry_add_ai", { p_token: token, p_content: reply });

  // Notify the team (best-effort, env-gated email + webhook).
  await sendTeamLeadNotification({
    email,
    source: "Anfrage-Chat",
    website: website || undefined,
    message: `${message}${phone ? ` · Tel: ${phone}` : ""}${budget ? ` · Budget: ${budget}` : ""}`,
  });
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "inquiry", name, email, phone, website, budget, message }),
    }).catch(() => {});
  }

  const messages = await callRpc("inquiry_messages", { p_token: token });
  return NextResponse.json({ token, messages: messages ?? [] });
}
