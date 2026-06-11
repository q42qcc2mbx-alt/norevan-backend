import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyUser } from "@/lib/auth-server";

// KI-Texthilfe: turns a customer's website description + focus into concrete,
// copy-ready improvement text. Gated to logged-in users so anonymous visitors
// can't run up AI costs (the public KI-Analyse on /analyse stays open).

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

const FOCUS_HINT: Record<string, string> = {
  texte:
    "Fokus: Texte/Copywriting — liefere konkrete, fertige Textbausteine (Überschriften, Absätze, Call-to-Actions).",
  seo: "Fokus: SEO — Title/Meta-Description-Vorschläge, Keyword-Ideen, Überschriften-Struktur, interne Verlinkung.",
  design: "Fokus: Design/UX — konkrete Layout-, Farb-, Abstands- und Mobil-Verbesserungen.",
  conversion:
    "Fokus: Conversion — Vertrauenselemente, klare Call-to-Actions, Angebots-/Preis-Darstellung, Reibung entfernen.",
  "ueber-uns": "Fokus: Schreibe einen fertigen, sympathischen 'Über uns'-Text zum Kopieren.",
  allgemein: "Fokus: allgemeine, priorisierte Verbesserungen.",
};

/** Template-based fallback so the helper works without an API key. */
function ruleBasedText(url: string, description: string, focus: string): string {
  const subject = description || `die Website ${url}`;
  const intro = `Hier sind priorisierte Verbesserungen für ${subject.slice(0, 140)}:`;
  const blocks: Record<string, string> = {
    texte: `${intro}

1. Überschrift (Vorschlag zum Kopieren):
   „Wir lösen [Ihr wichtigstes Kundenproblem] — schnell, zuverlässig und persönlich."

2. Einleitungstext:
   „Seit Jahren helfen wir Menschen wie Ihnen bei [Leistung]. Was uns auszeichnet: [1–2 konkrete Stärken]. Überzeugen Sie sich selbst — [Call-to-Action]."

3. Call-to-Action-Button: „Jetzt unverbindlich anfragen" (statt „Senden" oder „Mehr").

Tipp: Schreiben Sie aus Kundensicht („Sie erhalten …") statt aus Firmensicht („Wir bieten …").`,
    seo: `${intro}

1. Title-Tag (max. 60 Zeichen): „[Hauptleistung] in [Ort] | [Firmenname]"
2. Meta-Description (max. 155 Zeichen): „[Hauptleistung] vom Profi: [Nutzen 1], [Nutzen 2]. Jetzt kostenlos beraten lassen ✓"
3. Genau eine H1 pro Seite mit dem wichtigsten Keyword, H2 für Abschnitte.
4. Interne Verlinkung: Verlinken Sie von der Startseite auf jede Leistungsseite mit sprechendem Linktext.
5. Bilder: beschreibende Dateinamen + Alt-Texte mit Keyword-Bezug.`,
    design: `${intro}

1. Weißraum: Abstände zwischen Sektionen vergrößern (mind. 80px Desktop / 48px mobil).
2. Maximal 2 Schriftarten und eine klare Akzentfarbe für alle Buttons.
3. Mobil zuerst prüfen: Buttons mind. 44px hoch, Text mind. 16px.
4. Über dem Falz: Überschrift + Nutzenversprechen + ein einziger klarer Button.
5. Einheitliche Bildsprache statt gemischter Stock-Fotos.`,
    conversion: `${intro}

1. Ein klarer primärer Call-to-Action pro Seite — farblich hervorgehoben, mehrfach wiederholt.
2. Vertrauenselemente sichtbar platzieren: Bewertungen, Logos, Zertifikate, „Antwort in 24h".
3. Formulare radikal kürzen: Name, E-Mail, Nachricht reichen für den Erstkontakt.
4. Konkrete Zahlen statt Adjektive: „über 200 Projekte" statt „viel Erfahrung".
5. Einwände vorwegnehmen: kurze FAQ direkt neben dem Formular.`,
    "ueber-uns": `Fertiger „Über uns"-Text zum Kopieren (Platzhalter ersetzen):

„Hinter [Firmenname] stehen Menschen, die [Ihr Fachgebiet] lieben. Angefangen haben wir [Gründungsgeschichte in einem Satz]. Heute unterstützen wir [Zielgruppe] dabei, [Hauptnutzen].

Was uns ausmacht? Wir hören erst zu, dann handeln wir. Keine Pauschallösungen, sondern [individueller Ansatz]. Und wenn etwas mal nicht passt, sagen wir es ehrlich.

Lernen Sie uns kennen — wir freuen uns auf Ihre Nachricht."`,
    allgemein: `${intro}

1. Klarheit über dem Falz: In 5 Sekunden muss klar sein, was Sie anbieten und für wen.
2. Ein klarer Call-to-Action pro Seite (z. B. „Kostenlos anfragen").
3. Vertrauen aufbauen: echte Bewertungen, Referenzen, Gesicht zeigen.
4. Geschwindigkeit: Bilder komprimieren, unnötige Plugins entfernen.
5. Mobile Ansicht testen — dort entscheidet sich die Mehrheit Ihrer Besucher.

Für eine tiefe technische Prüfung: Nutzen Sie unsere kostenlose KI-Analyse unter /analyse.`,
  };
  return blocks[focus] ?? blocks.allgemein;
}

export async function POST(req: Request) {
  const user = await verifyUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Bitte loggen Sie sich ein, um die KI-Texthilfe zu nutzen." },
      { status: 401 },
    );
  }
  if (rateLimited(user.id)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen — bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { url?: string; description?: string; focus?: string }
    | null;
  const url = String(body?.url ?? "").trim().slice(0, 300);
  const description = String(body?.description ?? "").trim().slice(0, 4000);
  const focus = String(body?.focus ?? "allgemein");
  if (!url && !description) {
    return NextResponse.json(
      { error: "Bitte beschreiben Sie Ihre Website oder geben Sie eine URL an." },
      { status: 400 },
    );
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const system = `Du bist ein erfahrener Web-Berater (Copywriting, SEO, UX, Conversion) der Agentur NOREVAN Digital. Ein Kunde möchte seine Website verbessern.

Schreibe eine klare, sofort umsetzbare Antwort auf Deutsch (Sie-Form), die der Kunde direkt kopieren und verwenden kann.

Regeln:
- Sei konkret. Liefere fertige Texte/Vorschläge, keine vagen Tipps.
- Struktur: kurze Einleitung (1 Satz), dann nummerierte Verbesserungen. Wenn fertige Texte gefragt sind, gib sie wörtlich zum Kopieren aus.
- Priorisiere: das Wichtigste zuerst.
- Keine Floskeln, kein "Es kommt darauf an". Triff Annahmen, wenn nötig, und benenne sie kurz.
- ${FOCUS_HINT[focus] ?? FOCUS_HINT.allgemein}`;

      const response = await client.messages.create({
        model: process.env.AGENCY_AI_MODEL ?? "claude-opus-4-8",
        max_tokens: 4000,
        thinking: { type: "adaptive" },
        system,
        messages: [
          {
            role: "user",
            content: `Website${url ? ` (${url})` : ""}:\n${
              description || "(keine Beschreibung — leite anhand der URL/Branche sinnvolle Annahmen ab)"
            }\n\nGeben Sie mir die konkreten Verbesserungen zum Kopieren.`,
          },
        ],
      });
      if (response.stop_reason !== "refusal") {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        if (text) return NextResponse.json({ text });
      }
    } catch (err) {
      console.error("AI helper failed, falling back to templates:", err);
    }
  }

  return NextResponse.json({ text: ruleBasedText(url, description, focus) });
}
