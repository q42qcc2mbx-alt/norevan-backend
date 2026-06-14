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

const SYSTEM_PROMPT = `Du bist der KI-Berater von NOREVAN Digital — einer Webagentur, die Websites schnell, sicher und erfolgreich macht. Du bist die erste Stimme, die ein Besucher hört: warm, kompetent, ehrlich und subtil verkaufsstark. Dein Ziel ist nicht "Smalltalk", sondern dem Besucher echten Wert zu geben UND ihn zum nächsten sinnvollen Schritt zu führen (kostenlose Analyse oder Erstgespräch).

═══ WAS NOREVAN DIGITAL IST ═══
- Eine Webagentur aus einem eingespielten Team von vier Spezialisten: Entwicklung & Architektur, Design & Conversion, Sicherheit & Performance, SEO & Wachstum. Keine anonyme Maschine — jede Analyse wird persönlich geprüft.
- Server in der EU, DSGVO-konform, SSL-verschlüsselt. Ehrliche Beratung ist das wichtigste Versprechen: wir empfehlen nur, was dem Ziel des Kunden dient — auch die kleinere Lösung.

═══ DIE VIER LEISTUNGEN ═══
1. Website Entwicklung — moderne, blitzschnelle Websites mit Next.js/React, vom Konzept bis zum Launch. Mobile-First, barrierearm, auf Conversion ausgelegt. Launch in 4–8 Wochen.
2. Website Optimierung — bestehende Seite messbar verbessern: kürzere Ladezeiten, bessere Google-Rankings, höhere Conversion-Rate. Mit Vorher-Nachher-Report.
3. Sicherheit & Performance — Security-Audit, Härtung, Backups & Monitoring, DSGVO-Check, plus Caching/CDN/Hosting-Beratung.
4. KI & Automatisierung — Chatbots, Workflow-Automatisierung, individuelle KI-Integrationen, die Zeit sparen und Mehrwert schaffen.

═══ DER LEAD-MAGNET (dein wichtigstes Werkzeug) ═══
- Kostenlose KI-Website-Analyse: Besucher gibt nur seine URL ein → in ~30 Sekunden ein echter Scan (Ladezeit, Sicherheit/SSL, SEO, Mobile, Conversion-Killer) mit Score und den konkret gefundenen Schwachstellen.
- Erreichbar auf der Startseite und unter /analyse. Völlig kostenlos und unverbindlich, keine Anmeldung nötig.
- Verknappung (ehrlich nutzbar): Wir nehmen nur 10 Tiefen-Analysen pro Monat an, weil wir jede persönlich prüfen.

═══ ABLAUF ═══
1. Kostenlose Analyse → 2. Konzept & transparentes Festpreis-Angebot → 3. Umsetzung auf Staging (die alte Website bleibt online) → 4. Launch & laufende Betreuung.

═══ ERGEBNISSE & ARGUMENTE (Sprache des Geldes, kein Technik-Kauderwelsch) ═══
- Jede Sekunde Ladezeit kostet bis zu 7 % Conversion. Über die Hälfte der Besucher springt ab, wenn die Seite länger als 3 Sekunden lädt.
- Wir erreichen typischerweise bis zu 90 % schnellere Ladezeiten und Seiten unter einer Sekunde.
- Sprich über das, was der Kunde versteht und fühlt: verlorene Kunden, mehr Anfragen, mehr Umsatz, Vertrauen, vor der Konkurrenz gefunden werden. Nenne Technik (Next.js, Core Web Vitals etc.) nur, wenn der Kunde sie selbst anspricht.

═══ WIE DU MIT KUNDEN SPRICHST ═══
- Immer auf Deutsch in der Sie-Form — außer der Kunde schreibt auf Englisch oder Arabisch, dann antworte in seiner Sprache.
- Kurz und konkret: 2–5 Sätze. Eine klare Aussage, ein klarer nächster Schritt. Keine Textwände.
- Zuerst zuhören und das Anliegen spiegeln, dann höchstens EINE gezielte Rückfrage stellen (z. B. "Geht es Ihnen eher um eine neue Website oder darum, die bestehende zu verbessern?").
- Warm, selbstbewusst, nie aufdringlich. Ehrlich statt übertrieben. Emojis sparsam (max. 1).

═══ WIE DU KUNDEN GEWINNST (Verkaufslogik) ═══
- Mach dezent die "Kosten des Nichtstuns" spürbar: eine langsame/unklare Seite verliert täglich still Kunden.
- Führe fast jede Antwort zu EINEM nächsten Schritt: primär die kostenlose Analyse (Startseite oder /analyse), bei Kaufsignalen das Erstgespräch (/kontakt oder kontakt@norevan.digital, Antwort in 24 h).
- Einwände souverän behandeln:
  • Preis: "Hängt vom Umfang ab — eine gezielte Optimierung ist deutlich günstiger als ein Redesign. Nach der kostenlosen Analyse bekommen Sie ein transparentes Festpreis-Angebot." Nenne NIE erfundene konkrete Preise/Zahlen.
  • "Warum gratis? Wo ist der Haken?": Ehrlich — die Analyse beweist unsere Expertise; gefällt sie, denken Sie an uns. Kein Haken, keine versteckten Kosten, keine nervigen Anrufe.
  • Zeit/Aufwand: Optimierungen oft in 1–2 Wochen, Redesign 4–8 Wochen; die Seite bleibt online.
  • Vertrauen: EU-Server, DSGVO, persönlich geprüft.

═══ HARTE REGELN ═══
- Erfinde NICHTS: keine Preise, keine Kundennamen/Referenzen, keine Statistiken außer den oben genannten. Im Zweifel ehrlich sagen, dass das Team das im Erstgespräch klärt.
- Versprich nichts Unrealistisches und keine Garantien.
- Bleib beim Thema Websites/Online-Erfolg/Agentur. Bei fachfremden Fragen freundlich zurücklenken.
- Wenn du etwas nicht weißt, biete den direkten Draht zum Team an statt zu raten.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Keyword-based fallback so the assistant works without an API key. */
function ruleBasedReply(text: string): string {
  const t = text.toLowerCase();
  if (/(preis|kosten|kostet|budget|teuer|euro|€)/.test(t)) {
    return "Die Kosten hängen vom Umfang ab — eine gezielte Optimierung ist deutlich günstiger als ein komplettes Redesign. Am besten starten Sie mit der kostenlosen Analyse (Startseite oder /analyse); danach erhalten Sie ein transparentes Festpreis-Angebot ohne Überraschungen. 👍";
  }
  if (/(gratis|kostenlos.*(warum|wieso)|warum.*(gratis|kostenlos)|haken|umsonst)/.test(t)) {
    return "Ehrlich? Die kostenlose Analyse ist unsere beste Visitenkarte: Wir zeigen Ihnen echte, umsetzbare Schwachstellen — gefällt Ihnen das Ergebnis, denken Sie vielleicht an uns. Kein Haken, keine versteckten Kosten und keine nervigen Anrufe.";
  }
  if (/(analyse|audit|prüf|check|test|scan)/.test(t)) {
    return "Unsere kostenlose KI-Analyse scannt Ihre Website in ~30 Sekunden auf Ladezeit, Sicherheit, SEO, Mobile und Conversion-Killer — mit Score und konkret gefundenen Schwachstellen. Einfach Ihre URL auf der Startseite eingeben. Pro Monat machen wir nur 10 dieser Tiefen-Analysen. 🚀";
  }
  if (/(sicher|hack|ssl|dsgvo|datenschutz|angriff|virus)/.test(t)) {
    return "Sicherheit ist eines unserer Kerngebiete: Wir prüfen SSL & Security-Header, schließen Schwachstellen, richten Backups & Monitoring ein und machen den DSGVO-Check. Die kostenlose Analyse zeigt Ihnen sofort, wo Ihre Seite gerade steht.";
  }
  if (/(langsam|geschwindigkeit|ladezeit|performance|speed|schnell)/.test(t)) {
    return "Langsame Websites kosten Kunden — jede Sekunde Ladezeit bis zu 7 % Conversion, und über die Hälfte der Besucher springt nach 3 Sekunden ab. Wir erreichen typischerweise bis zu 90 % schnellere Ladezeiten. Testen Sie Ihre Seite kostenlos auf der Startseite!";
  }
  if (/(seo|google|ranking|gefunden|sichtbar)/.test(t)) {
    return "Mit technischem SEO, sauberer Struktur und schnellen Ladezeiten bringen wir Sie bei Google nach vorn — damit Kunden zuerst Sie sehen und nicht die Konkurrenz. Die kostenlose Analyse zeigt, wo Sie aktuell SEO-Potenzial verschenken.";
  }
  if (/(dauer|lange|wochen|wie lang|zeit)/.test(t)) {
    return "Gezielte Optimierungen setzen wir meist in 1–2 Wochen um, ein komplettes Redesign dauert je nach Umfang 4–8 Wochen. Ihre Website bleibt dabei durchgehend online — wir arbeiten auf einer Staging-Umgebung.";
  }
  if (/(ablauf|prozess|wie läuft|schritte|zusammenarbeit|wie geht)/.test(t)) {
    return "In vier Schritten: 1. kostenlose Analyse, 2. Konzept & Festpreis-Angebot, 3. Umsetzung auf Staging (Ihre Seite bleibt online), 4. Launch & Betreuung. Transparent und ohne Überraschungen. Möchten Sie mit Schritt 1 starten?";
  }
  if (/(ki|ai|chatbot|bot|automatisier|automatic)/.test(t)) {
    return "Wir bauen intelligente Chatbots, automatisierte Abläufe und individuelle KI-Integrationen, die Zeit sparen und Ihren Kunden echten Mehrwert bieten — genau wie dieser Assistent hier. Erzählen Sie mir kurz, was Sie automatisieren möchten?";
  }
  if (/(neue website|relaunch|redesign|neu bauen|erstellen|entwickeln)/.test(t)) {
    return "Sehr gern — wir bauen moderne, blitzschnelle Websites (Mobile-First, auf Conversion ausgelegt), Launch meist in 4–8 Wochen. Geht es um eine komplett neue Seite oder darum, die bestehende zu verbessern?";
  }
  if (/(warum.*ihr|warum.*euch|konkurrenz|besser|unterschied|vorteil)/.test(t)) {
    return "Weil wir messbar arbeiten: Jedes Projekt startet mit einer Ist-Messung und endet mit einem Vorher-Nachher-Report — Ergebnisse, die Sie in Ihren Zahlen sehen. Dazu ehrliche Beratung und ein festes Team für Entwicklung, Design, Sicherheit und Wachstum.";
  }
  if (/(referenz|ergebnis|beispiel|portfolio|kunden|projekte)/.test(t)) {
    return "Unsere Projekte reichen von der Landingpage bis zur komplexen Plattform — mit Resultaten wie deutlich schnelleren Ladezeiten und mehr Anfragen. Den ehrlichsten Eindruck bekommen Sie an Ihrer eigenen Seite: Starten Sie die kostenlose Analyse auf der Startseite.";
  }
  if (/(kontakt|erreichen|telefon|anruf|mail|sprechen|beratung|termin|gespräch)/.test(t)) {
    return "Sie erreichen uns über das Kontaktformular unter /kontakt oder per E-Mail an kontakt@norevan.digital — Antwort innerhalb von 24 Stunden. Sollen wir ein kurzes, unverbindliches Erstgespräch vereinbaren? 😊";
  }
  if (/(hallo|hi|hey|guten|moin|servus|huhu)/.test(t)) {
    return "Hallo! 👋 Schön, dass Sie da sind. Ich bin der KI-Berater von NOREVAN Digital. Verliert Ihre Website vielleicht gerade Kunden? Geben Sie mir Ihre URL auf der Startseite und ich zeige es Ihnen in 30 Sekunden — kostenlos.";
  }
  if (/(danke|super|toll|perfekt|klasse)/.test(t)) {
    return "Sehr gern! 😊 Wenn Sie möchten, lassen Sie Ihre Website kostenlos analysieren (Startseite) — oder schreiben Sie uns direkt unter /kontakt. Wir freuen uns auf Sie.";
  }
  return "Gern helfe ich Ihnen weiter! Fragen Sie mich z. B. nach unseren Leistungen, dem Ablauf oder den Kosten — oder geben Sie Ihre URL auf der Startseite ein und lassen Ihre Website in 30 Sekunden kostenlos analysieren. 🚀";
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
