import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { buildSnapshot } from "@/lib/jarvis/snapshot";
import {
  listMemories,
  addMemory,
  addTask,
  listChatMessages,
  addChatMessage,
} from "@/lib/jarvis/store";

// JARVIS OMEGA chat — owner-only. Real Claude with live business data, a
// long-term memory tool and a task tool. The model can disagree, must not
// flatter, and is told honestly what it can and cannot do.

const MODEL = process.env.JARVIS_MODEL || "claude-opus-4-8";

const PERSONAS: Record<string, string> = {
  jarvis: "Du agierst als JARVIS selbst: digitaler Geschäftsführer mit Gesamtblick über Umsatz, Betrieb, Technik und Marketing.",
  developer: "Du agierst als DEVELOPER AGENT: Senior-Entwickler (Next.js, Express, Supabase, Stripe). Denke in konkreten technischen Lösungen, nenne Dateien/Konzepte, finde Fehlerursachen.",
  marketing: "Du agierst als MARKETING AGENT: Performance-Marketing für Streetwear (TikTok, Instagram, Newsletter). Liefere konkrete Content-Ideen, Posting-Zeiten und Kampagnen — mit Begründung.",
  sales: "Du agierst als SALES AGENT: Analysiere Verkäufe, erkenne Gewinner-/Verlierer-Produkte, Preis- und Bundle-Chancen, Umsatzhebel.",
  seo: "Du agierst als SEO AGENT: Keywords, Meta-Daten, Ladezeit, interne Verlinkung, strukturierte Daten. Konkrete, priorisierte Maßnahmen.",
  security: "Du agierst als SECURITY AGENT: Bedrohungen, Bots, Spam, Schwachstellen, Zugriffsrechte. Bewerte Risiken nüchtern und priorisiere Gegenmaßnahmen.",
  design: "Du agierst als DESIGN AGENT: UX/UI, Conversion-Design, Produktseiten, Mobile. Kritisiere ehrlich und schlage konkrete Verbesserungen vor.",
  support: "Du agierst als SUPPORT AGENT: Kundenanfragen, häufige Probleme, Antwortvorlagen, Retouren-Prozesse.",
  team: "TEAM-MODUS: Simuliere eine kurze interne Diskussion deiner Agenten (Marketing, Sales, SEO, Developer, Security, Design, Support) zur Frage — je Agent 1–2 Sätze mit Kürzel, danach »ENTSCHEIDUNG:« mit der besten gemeinsamen Empfehlung.",
};

const TOOLS: Anthropic.Tool[] = [
  {
    name: "remember",
    description:
      "Speichere eine dauerhafte Erinnerung im Langzeitgedächtnis. Rufe dieses Tool auf, wenn der Owner ein Ziel, eine Entscheidung, eine Vorliebe, eine Strategie oder ein Learning äußert, das künftige Gespräche beeinflussen soll — oder wenn er explizit »merk dir« sagt.",
    input_schema: {
      type: "object" as const,
      properties: {
        kind: { type: "string", enum: ["ziel", "entscheidung", "vorliebe", "strategie", "fehler", "verbesserung", "notiz"], description: "Art der Erinnerung" },
        content: { type: "string", description: "Die Erinnerung, kurz und präzise formuliert" },
      },
      required: ["kind", "content"],
    },
  },
  {
    name: "add_task",
    description:
      "Lege eine Aufgabe im Aufgabenmanager des Owners an. Rufe dieses Tool auf, wenn aus dem Gespräch eine konkrete To-do entsteht (etwas umsetzen, prüfen, nachbestellen) oder der Owner darum bittet.",
    input_schema: {
      type: "object" as const,
      properties: { title: { type: "string", description: "Kurzer, handlungsorientierter Aufgabentitel" } },
      required: ["title"],
    },
  },
];

async function requireOwner() {
  const user = await getAdminUser();
  if (!user || effectiveRole(user) !== "owner") return null;
  return user;
}

function eur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

async function buildSystem(agent: string): Promise<string> {
  const [snapshot, memories] = await Promise.all([buildSnapshot(), listMemories()]);
  const persona = PERSONAS[agent] ?? PERSONAS.jarvis;

  const memoryBlock = memories.length
    ? memories.map((m) => `- [${m.kind}] ${m.content}`).join("\n")
    : "- (noch keine Einträge)";

  return `Du bist JARVIS OMEGA — die exklusive KI des Norevan-Owners (Streetwear-Shop, Berlin). Du sprichst Deutsch, duzt den Owner und antwortest präzise und professionell.

KERNPRINZIPIEN (nicht verhandelbar):
- Lüge niemals. Wenn du etwas nicht weißt oder Daten fehlen, sage es.
- Denke kritisch und stimme nicht blind zu. Wenn eine Idee des Owners schwach ist: (1) begründe warum, (2) zeige Risiken, (3) zeige bessere Alternativen, (4) sprich eine klare Empfehlung aus.
- Schmeichle nicht. Sei direkt, aber respektvoll.
- Antworte kompakt: kurze Absätze, Listen wo sinnvoll, keine Floskeln.

${persona}

DEINE WERKZEUGE & GRENZEN (ehrlich kommunizieren):
- Du siehst die Live-Geschäftsdaten unten und dein Langzeitgedächtnis.
- Du kannst Erinnerungen speichern (remember) und Aufgaben anlegen (add_task) — nutze sie aktiv.
- Du kannst die Website NICHT direkt verändern, nichts deployen und nicht selbstständig im Internet surfen. Wenn Umsetzung nötig ist: formuliere eine präzise Aufgabe (add_task) oder eine konkrete Anweisung, die der Owner an seinen Entwickler/Claude Code geben kann.

LIVE-GESCHÄFTSDATEN (Stand ${new Date(snapshot.generatedAt).toLocaleString("de-DE")}):
- Umsatz realisiert: heute ${eur(snapshot.revenue.todayCents)} · 7 Tage ${eur(snapshot.revenue.week7Cents)} · 30 Tage ${eur(snapshot.revenue.days30Cents)} · gesamt ${eur(snapshot.revenue.totalCents)}
- Bestellungen: heute ${snapshot.orders.today} · offen (unbezahlt) ${snapshot.orders.pendingOpen} (davon >48h: ${snapshot.orders.pendingStale}) · gesamt ${snapshot.orders.total}
- Besucher (30 T): ${snapshot.visitors.last30d} · gerade online: ${snapshot.visitors.online} · Conversion: ${snapshot.visitors.conversionPct.toFixed(1)} %
- Topseller: ${snapshot.topSellers.map((t) => `${t.name} (${t.qty}× / ${eur(t.revenueCents)})`).join(", ") || "—"}
- Lager kritisch: ${snapshot.lowStock.map((p) => `${p.name}: ${p.stock}`).join(", ") || "alles ok"}
- Produkte ohne Einkaufspreis: ${snapshot.missingCost.length} von ${snapshot.productCount}
- Aktive Rabattcodes: WILLKOMMEN10 (Newsletter), COMEBACK10 (Warenkorb-Erinnerung)
- Proaktive Befunde: ${snapshot.findings.map((f) => `[${f.level}] ${f.text}`).join(" | ")}

LANGZEITGEDÄCHTNIS:
${memoryBlock}`;
}

export async function GET() {
  if (!(await requireOwner())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const messages = await listChatMessages(40);
  return NextResponse.json({
    messages,
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
    model: MODEL,
  });
}

export async function POST(req: Request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { message?: string; agent?: string } | null;
  const text = String(body?.message ?? "").trim();
  const agent = String(body?.agent ?? "jarvis");
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply:
        "Ich bin noch nicht mit meinem Gehirn verbunden, Sir. Bitte hinterlege den API-Schlüssel `ANTHROPIC_API_KEY` in Vercel (Projekt → Settings → Environment Variables) und deploye neu — danach bin ich voll einsatzbereit.",
      setup: true,
    });
  }

  const client = new Anthropic();

  // Conversation memory: persisted history + the new message.
  const history = await listChatMessages(20);
  const messages: Anthropic.MessageParam[] = [];
  for (const m of history) {
    if (messages.length === 0 && m.role !== "user") continue; // first must be user
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({ role: "user", content: text });

  const system = await buildSystem(agent);
  const actions: string[] = [];

  try {
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system,
      tools: TOOLS,
      messages,
    });

    // Manual tool loop (max 3 rounds): remember → memory, add_task → tasks.
    for (let round = 0; round < 3 && response.stop_reason === "tool_use"; round++) {
      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      messages.push({ role: "assistant", content: response.content });

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        let result = "ok";
        try {
          if (tu.name === "remember") {
            const input = tu.input as { kind?: string; content?: string };
            await addMemory(String(input.kind ?? "notiz"), String(input.content ?? ""));
            actions.push(`🧠 Gemerkt: ${input.content}`);
            result = "Erinnerung gespeichert.";
          } else if (tu.name === "add_task") {
            const input = tu.input as { title?: string };
            await addTask(String(input.title ?? ""));
            actions.push(`✅ Aufgabe angelegt: ${input.title}`);
            result = "Aufgabe angelegt.";
          } else {
            result = `Unbekanntes Tool: ${tu.name}`;
          }
        } catch (e) {
          result = `Fehler: ${(e as Error).message}`;
        }
        results.push({ type: "tool_result", tool_use_id: tu.id, content: result });
      }
      messages.push({ role: "user", content: results });

      response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        system,
        tools: TOOLS,
        messages,
      });
    }

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // Persist the exchange (best-effort).
    addChatMessage("user", text, agent).catch(() => {});
    addChatMessage("assistant", reply || "(keine Antwort)", agent).catch(() => {});

    return NextResponse.json({ reply, actions });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({
        reply: "Mein API-Schlüssel wird abgelehnt (401). Bitte prüfe `ANTHROPIC_API_KEY` in Vercel — vermutlich ist er ungültig oder abgelaufen.",
        setup: true,
      });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ reply: "Zu viele Anfragen an mein Gehirn (Rate-Limit). Bitte einen Moment warten und erneut versuchen." });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ reply: `API-Fehler (${error.status}): ${error.message}. Bitte erneut versuchen.` });
    }
    throw error;
  }
}
