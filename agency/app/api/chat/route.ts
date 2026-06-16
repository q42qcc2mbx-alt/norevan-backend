import { NextResponse } from "next/server";
import { chatReply, type ChatMessage } from "@/lib/chat-ai";
import { clientIp, rateLimited } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (rateLimited("chat", clientIp(req), 30, 5 * 60 * 1000)) {
    return NextResponse.json(
      { reply: "Einen Moment bitte — Sie schreiben sehr schnell. Versuchen Sie es gleich erneut. 🙂" },
      { status: 200 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter(
      (m): m is ChatMessage =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length <= 2000,
    )
    .slice(-12);

  if (!messages.some((m) => m.role === "user")) {
    return NextResponse.json({ error: "Keine Nachricht erhalten." }, { status: 400 });
  }

  return NextResponse.json({ reply: await chatReply(messages) });
}
