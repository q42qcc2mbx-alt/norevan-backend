import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const SYSTEM_PROMPT = `Du bist der freundliche KI-Assistent von NOREVAN Digital, einer Webagentur für Website-Entwicklung und -Optimierung.

Über NOREVAN Digital:
- Leistungen: Website Entwicklung (Next.js/React, 4–8 Wochen), Website Optimierung (Performance, Core Web Vitals), Sicherheit & Performance (Security-Audits, Monitoring, DSGVO), KI & Automatisierung (Chatbots, Workflows)
- Kostenlose KI-Website-Analyse unter /analyse — prüft Performance, Sicherheit, SEO, Mobile und mehr in 30 Sekunden
- Kontakt: /kontakt oder kontakt@norevan.digital, Antwort innerhalb von 24 Stunden
- Ablauf: 1. Kostenlose Analyse, 2. Konzept & Festpreis-Angebot, 3. Umsetzung auf Staging (Website bleibt online), 4. Launch & Betreuung
- Ergebnisse: bis zu 90% schnellere Ladezeiten, Vorher-Nachher-Report mit Kennzahlen

Regeln:
- Antworte kurz (2-4 Sätze), freundlich und auf Deutsch in der Sie-Form.
- Empfiehl bei Interesse die kostenlose Analyse (/analyse) oder das Kontaktformular (/kontakt).
- Nenne keine konkreten Preise — die hängen vom Projekt ab; verweise auf das kostenlose Erstgespräch.
- Bleib beim Thema Websites/Agentur. Bei fachfremden Fragen lenke höflich zurück.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Keyword-based fallback so the assistant works without an API key. */
function ruleBasedReply(text: string): string {
  const t = text.toLowerCase();
  if (/(preis|kosten|kostet|budget|teuer)/.test(t)) {
    return "Die Kosten hängen vom Umfang ab — eine gezielte Optimierung ist deutlich günstiger als ein komplettes Redesign. Am besten starten Sie mit der kostenlosen Analyse unter /analyse, danach erhalten Sie ein transparentes Festpreis-Angebot. 👍";
  }
  if (/(analyse|audit|prüf|check|testen)/.test(t)) {
    return "Unsere kostenlose KI-Analyse prüft Ihre Website in etwa 30 Sekunden auf Performance, Sicherheit, SEO und Mobile-Optimierung. Einfach unter /analyse Ihre URL eingeben — kostenlos und unverbindlich. 🚀";
  }
  if (/(sicher|hack|ssl|dsgvo|datenschutz)/.test(t)) {
    return "Sicherheit ist eines unserer Kerngebiete: Wir prüfen SSL, Security-Header und Schwachstellen, härten Ihre Website und richten Backups & Monitoring ein. Die kostenlose Analyse unter /analyse zeigt Ihnen sofort den aktuellen Stand.";
  }
  if (/(langsam|geschwindigkeit|ladezeit|performance|speed)/.test(t)) {
    return "Langsame Websites kosten Kunden — jede Sekunde Ladezeit bis zu 7% Conversion. Wir erreichen typischerweise bis zu 90% schnellere Ladezeiten. Testen Sie Ihre Website kostenlos unter /analyse!";
  }
  if (/(seo|google|ranking|gefunden)/.test(t)) {
    return "Mit technischem SEO, sauberer Struktur und schnellen Ladezeiten bringen wir Sie bei Google nach vorn. Die kostenlose Analyse unter /analyse zeigt, wo Ihre Website aktuell SEO-Potenzial verschenkt.";
  }
  if (/(dauer|lange|wochen|zeit)/.test(t)) {
    return "Gezielte Optimierungen setzen wir meist in 1–2 Wochen um, ein komplettes Redesign dauert je nach Umfang 4–8 Wochen. Ihre Website bleibt dabei durchgehend online.";
  }
  if (/(leistung|angebot|service|macht ihr|könnt ihr|bietet)/.test(t)) {
    return "Wir bieten vier Kernleistungen: Website Entwicklung, Website Optimierung, Sicherheit & Performance sowie KI & Automatisierung. Details finden Sie unter /leistungen — oder starten Sie direkt mit der kostenlosen Analyse unter /analyse.";
  }
  if (/(kontakt|erreichen|telefon|mail|sprechen|beratung)/.test(t)) {
    return "Sie erreichen uns über das Kontaktformular unter /kontakt oder per E-Mail an kontakt@norevan.digital — wir antworten innerhalb von 24 Stunden. 😊";
  }
  if (/(hallo|hi|hey|guten|moin|servus)/.test(t)) {
    return "Hallo! 👋 Schön, dass Sie da sind. Ich beantworte gern Fragen zu unseren Leistungen — oder soll ich Ihnen zeigen, wie Sie Ihre Website kostenlos analysieren lassen?";
  }
  return "Gern helfe ich Ihnen weiter! Fragen Sie mich z. B. nach unseren Leistungen, Preisen oder dem Ablauf — oder starten Sie direkt mit der kostenlosen Website-Analyse unter /analyse. 🚀";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
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

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "Keine Nachricht erhalten." }, { status: 400 });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const response = await client.messages.create({
        model: process.env.AGENCY_AI_MODEL ?? "claude-opus-4-8",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      });
      if (response.stop_reason !== "refusal") {
        const text = response.content.find((b) => b.type === "text")?.text;
        if (text) return NextResponse.json({ reply: text });
      }
    } catch (err) {
      console.error("Chat AI failed, falling back to rules:", err);
    }
  }

  return NextResponse.json({ reply: ruleBasedReply(lastUser.content) });
}
