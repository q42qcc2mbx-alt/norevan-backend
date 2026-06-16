import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyUser } from "@/lib/auth-server";
import { SUPABASE_URL, SUPABASE_KEY } from "@/lib/supabase";
import { pricingSummary } from "@/lib/site.config";
import { rateLimited } from "@/lib/security";

// Internal AI assistant for the NOREVAN TEAM (admin area). Gated: requires a
// logged-in user whose e-mail is in agency_admins. Helps draft customer
// replies, suggests website improvements, explains pricing & the funnel.

export const runtime = "nodejs";

const SYSTEM_PROMPT = `DEINE ROLLE (genau diese): Du bist der interne Team-Co-Pilot von NOREVAN Digital im Admin-Bereich. Dein Job: dem Team schnell, konkret und clever helfen — Kundenantworten formulieren, Verbesserungen vorschlagen, beim Verkauf coachen. Mit dir spricht KEIN Kunde.
DENKWEISE: Denke INTERN kurz mit, bevor du antwortest — was braucht der Kollege gerade wirklich, und was ist die konkret umsetzbare Hilfe? Frag nur nach, wenn echter Kontext fehlt. Gib nie deine Gedanken aus, nur das Ergebnis.

Du bist der interne KI-Assistent für das TEAM von NOREVAN Digital (Admin-Bereich). Mit dir spricht KEIN Kunde, sondern ein Team-Mitglied. Sei der clevere Kollege, der schnell und konkret hilft.

DU KANNST & SOLLST:
- Unser Angebot, unsere Preise und unseren Ablauf erklären (intern offen).
- Antworten an Kunden/Leads formulieren — professionell, Sie-Form, verkaufsstark aber ehrlich; auf Wunsch fertig zum Kopieren. Frag kurz nach Kontext, wenn er fehlt.
- Konkrete, priorisierte Website-Verbesserungen für einen Kunden vorschlagen (Performance, SEO, Conversion, Sicherheit) — umsetzbar, kein Geschwafel.
- Erklären, wie unsere eigene Website & der Lead-Funnel funktionieren: Startseite = ein URL-Feld → echter 30-Sek-Scan → E-Mail-Gate mit der echten Fehlerzahl → Report per E-Mail. Leads landen im Team-Dashboard unter „Analysen" (Funnel-Leads sind markiert), 1-Klick „→ Projekt".
- Beim Verkauf coachen: Einwandbehandlung, der nächste konkrete Schritt.

NOREVAN-WISSEN:
- Team: vier Spezialisten (Entwicklung & Architektur, Design & Conversion, Sicherheit & Performance, SEO & Wachstum). EU-Server, DSGVO, SSL.
- 4 Leistungen: Website Entwicklung (Next.js/React, 4–8 Wochen), Website Optimierung (Performance/SEO/Conversion, Vorher-Nachher-Report), Sicherheit & Performance (Audit, Härtung, Monitoring, DSGVO), KI & Automatisierung (Chatbots, Workflows).
- Ablauf: 1. kostenlose Analyse → 2. Konzept & Festpreis → 3. Umsetzung auf Staging (Seite bleibt online) → 4. Launch & Betreuung.
- Argumente (Sprache des Geldes): jede Sekunde Ladezeit bis zu 7 % Conversion; >50 % springen nach 3 Sek. ab; bis zu 90 % schnellere Ladezeiten.

STIL: kurz, konkret, hilfreich, Deutsch. Lieferst du einen fertigen Kundentext, kennzeichne ihn klar (z. B. „Vorschlag zum Kopieren:"). Erfinde keine Kundennamen oder Statistiken außer den genannten; Preise gemäß Liste unten.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Keyword fallback so the assistant works without an API key. */
function ruleBasedReply(text: string): string {
  const t = text.toLowerCase();
  if (/(antwort|formulier|schreib|mail|nachricht|lead|reply)/.test(t)) {
    return "Gern. Schick mir kurz den Kontext (worum geht es, welcher Ton, was ist das Ziel?), dann formuliere ich eine fertige Antwort in der Sie-Form zum Kopieren. Tipp: immer mit einem konkreten nächsten Schritt enden (kostenlose Analyse oder Erstgespräch).";
  }
  if (/(verbesser|optimier|schneller|seo|conversion|fix|problem)/.test(t)) {
    return "Die schnellsten Hebel sind meist: 1) Ladezeit unter 1 Sek. (Bilder/Caching/CDN), 2) ein klarer Call-to-Action pro Seite, 3) mobil-optimiert, 4) Vertrauenselemente sichtbar. Für die genaue, auf die Kundenseite bezogene Liste: URL in die kostenlose Analyse geben — der Score zeigt die Prioritäten.";
  }
  if (/(preis|kosten|kostet|angebot|euro|€)/.test(t)) {
    return "Unsere Preis-Orientierung steht in der Konfiguration — nenne sie als „ab“-Werte und betone, dass der Festpreis nach der kostenlosen Analyse folgt. Optimierung ist meist deutlich günstiger als ein Redesign.";
  }
  if (/(funnel|website|funktion|wie läuft|lead|dashboard)/.test(t)) {
    return "Der Funnel: Startseite zeigt nur ein URL-Feld → echter 30-Sek-Scan → E-Mail-Gate mit der echten Fehlerzahl → Report per Mail. Jeder Lead landet hier im Dashboard unter „Analysen“ (Funnel-Leads sind markiert). Mit „→ Projekt“ machst du daraus mit einem Klick ein Projekt.";
  }
  return "Ich bin dein interner Assistent: Ich formuliere Kundenantworten, schlage Website-Verbesserungen vor, erkläre Preise & den Funnel und helfe beim Verkauf. Was brauchst du?";
}

/** Confirm the logged-in user is an admin (RLS lets them read their own row). */
async function isAdmin(req: Request, email: string): Promise<boolean> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/agency_admins?select=email&email=eq.${encodeURIComponent(email)}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return false;
    const rows = (await res.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const user = await verifyUser(req);
  if (!user || !(await isAdmin(req, user.email))) {
    return NextResponse.json(
      { error: "Dieser Assistent ist dem NOREVAN-Team vorbehalten." },
      { status: 401 },
    );
  }
  if (rateLimited("admin-chat", user.id, 40, 5 * 60 * 1000)) {
    return NextResponse.json(
      { reply: "Einen Moment bitte — gleich wieder versuchen. 🙂" },
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
        m.content.length <= 4000,
    )
    .slice(-14);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "Keine Nachricht erhalten." }, { status: 400 });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const response = await client.messages.create({
        model: process.env.AGENCY_AI_MODEL ?? "claude-opus-4-8",
        max_tokens: 2048,
        thinking: { type: "adaptive" },
        system: `${SYSTEM_PROMPT}\n\n${pricingSummary()}`,
        messages,
      });
      if (response.stop_reason !== "refusal") {
        const reply = response.content.find((b) => b.type === "text")?.text;
        if (reply) return NextResponse.json({ reply });
      }
    } catch (err) {
      console.error("Admin chat AI failed, falling back to rules:", err);
    }
  }

  return NextResponse.json({ reply: ruleBasedReply(lastUser.content) });
}
