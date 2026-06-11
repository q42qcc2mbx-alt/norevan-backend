import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// AI endpoint: turns a customer's website description + focus into concrete,
// copy-ready improvement text. Uses the official Anthropic SDK.
//
// SECURITY: gate this to logged-in users in production (read your session
// cookie here and return 401 if absent) so you don't pay for anonymous calls.

export const dynamic = "force-dynamic";

const MODEL = process.env.AI_MODEL || "claude-opus-4-8";

const FOCUS_HINT: Record<string, string> = {
  texte: "Fokus: Texte/Copywriting — liefere konkrete, fertige Textbausteine (Überschriften, Absätze, CTAs).",
  seo: "Fokus: SEO — Title/Meta-Description-Vorschläge, Keyword-Ideen, Überschriften-Struktur, interne Verlinkung.",
  design: "Fokus: Design/UX — konkrete Layout-, Farb-, Abstands- und Mobil-Verbesserungen.",
  conversion: "Fokus: Conversion — Vertrauenselemente, klare CTAs, Angebot/Preis-Darstellung, Reibung entfernen.",
  "ueber-uns": "Fokus: schreibe einen fertigen, sympathischen 'Über uns'-Text zum Kopieren.",
  allgemein: "Fokus: allgemeine, priorisierte Verbesserungen.",
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "KI nicht konfiguriert — bitte ANTHROPIC_API_KEY in den Umgebungsvariablen setzen." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { url?: string; description?: string; focus?: string }
    | null;
  const url = String(body?.url ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const focus = String(body?.focus ?? "allgemein");
  if (!url && !description) {
    return NextResponse.json({ error: "Bitte URL oder Beschreibung angeben." }, { status: 400 });
  }

  const client = new Anthropic();

  const system = `Du bist ein erfahrener Web-Berater (Copywriting, SEO, UX, Conversion). Ein Kunde möchte seine Website verbessern.

Schreibe eine klare, sofort umsetzbare Antwort auf Deutsch, die der Kunde direkt kopieren und verwenden kann.

Regeln:
- Sei konkret. Liefere fertige Texte/Vorschläge, keine vagen Tipps.
- Struktur: kurze Einleitung (1 Satz), dann nummerierte Verbesserungen. Wenn fertige Texte gefragt sind, gib sie wörtlich zum Kopieren aus.
- Priorisiere: das Wichtigste zuerst.
- Keine Floskeln, kein "Es kommt darauf an". Triff Annahmen, wenn nötig, und benenne sie kurz.
- ${FOCUS_HINT[focus] ?? FOCUS_HINT.allgemein}`;

  const userMsg = `Website${url ? ` (${url})` : ""}:
${description || "(keine Beschreibung — leite anhand der URL/Branche sinnvolle Annahmen ab)"}

Gib mir die konkreten Verbesserungen zum Kopieren.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system,
      messages: [{ role: "user", content: userMsg }],
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "API-Schlüssel ungültig (401)." }, { status: 502 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Zu viele Anfragen — kurz warten." }, { status: 429 });
    }
    return NextResponse.json({ error: "KI-Fehler — bitte erneut versuchen." }, { status: 502 });
  }
}
