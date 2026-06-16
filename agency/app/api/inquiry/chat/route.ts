import { NextResponse } from "next/server";
import { callRpc } from "@/lib/db";
import { chatReply, type ChatMessage } from "@/lib/chat-ai";
import { clientIp, rateLimited, isBot, clean } from "@/lib/security";

export const runtime = "nodejs";

interface Msg {
  sender: "visitor" | "ai" | "admin";
  content: string;
  created_at: string;
}

function toChatMessages(rows: Msg[]): ChatMessage[] {
  return rows.map((m) => ({
    role: m.sender === "visitor" ? "user" : "assistant",
    content: m.content,
  }));
}

/** Poll for the conversation's messages (visitor sees admin/AI replies). */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "Kein Token." }, { status: 400 });
  const messages = await callRpc<Msg[]>("inquiry_messages", { p_token: token });
  return NextResponse.json({ messages: messages ?? [] });
}

/** Visitor sends a message → AI replies while ai_active, else just stored. */
export async function POST(req: Request) {
  if (rateLimited("inquiry-chat", clientIp(req), 40, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Einen Moment bitte — gleich erneut versuchen." }, { status: 429 });
  }

  let body: { token?: string; content?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (isBot(body)) return NextResponse.json({ error: "Abgelehnt." }, { status: 422 });

  const token = clean(body.token, 200);
  const content = clean(body.content, 2000);
  if (!token || !content) {
    return NextResponse.json({ error: "Token und Nachricht erforderlich." }, { status: 400 });
  }

  // Store the visitor message; null = token unknown.
  const aiActive = await callRpc<boolean | null>("inquiry_post", { p_token: token, p_content: content });
  if (aiActive === null) {
    return NextResponse.json({ error: "Gespräch nicht gefunden." }, { status: 404 });
  }

  // While the AI is in charge, generate a reply; once an admin takes over
  // (ai_active=false), the AI stays silent and the admin answers from the
  // dashboard.
  if (aiActive) {
    const rows = (await callRpc<Msg[]>("inquiry_messages", { p_token: token })) ?? [];
    const reply = await chatReply(toChatMessages(rows));
    await callRpc("inquiry_add_ai", { p_token: token, p_content: reply });
  }

  const messages = await callRpc<Msg[]>("inquiry_messages", { p_token: token });
  return NextResponse.json({ messages: messages ?? [], aiActive });
}
