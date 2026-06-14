import Anthropic from "@anthropic-ai/sdk";
import { runAudit, type AuditResult } from "./audit";

export interface AnalyseCategory {
  name: string;
  score: number;
}

export interface AnalyseProblem {
  titel: string;
  beschreibung: string;
  prioritaet: "hoch" | "mittel" | "niedrig";
  kategorie: string;
}

export interface AnalyseRecommendation {
  titel: string;
  beschreibung: string;
  aufwand: "gering" | "mittel" | "hoch";
}

export interface AnalyseResult {
  url: string;
  score: number;
  summary: string;
  kategorien: AnalyseCategory[];
  probleme: AnalyseProblem[];
  verbesserungen: AnalyseRecommendation[];
  empfehlungen: string[];
}

const CATEGORY_NAMES = [
  "Design",
  "Geschwindigkeit",
  "SEO",
  "Mobile Optimierung",
  "Sicherheit",
  "Benutzerfreundlichkeit",
  "Conversion",
  "Struktur",
] as const;

/** Map raw audit findings onto the eight analysis categories. */
function categoryScores(audit: AuditResult): AnalyseCategory[] {
  const penalty: Record<string, number> = {};
  const add = (cat: string, severity: string) => {
    penalty[cat] = (penalty[cat] ?? 0) + (severity === "critical" ? 30 : severity === "warning" ? 14 : 0);
  };
  for (const f of audit.findings) {
    switch (f.category) {
      case "Performance":
        add("Geschwindigkeit", f.severity);
        add("Conversion", f.severity === "critical" ? "warning" : "good");
        break;
      case "Sicherheit":
        add("Sicherheit", f.severity);
        break;
      case "SEO":
        add("SEO", f.severity);
        add("Struktur", f.severity === "critical" ? "warning" : "good");
        break;
      case "UX":
        add("Benutzerfreundlichkeit", f.severity);
        add("Mobile Optimierung", f.severity);
        add("Design", f.severity === "critical" ? "warning" : "good");
        break;
    }
  }
  return CATEGORY_NAMES.map((name) => ({
    name,
    score: Math.max(15, Math.min(96, 92 - (penalty[name] ?? 4))),
  }));
}

/** Deterministic fallback when no ANTHROPIC_API_KEY is configured. */
function ruleBasedAnalyse(audit: AuditResult, goal: string): AnalyseResult {
  const probleme: AnalyseProblem[] = audit.findings
    .filter((f) => f.severity !== "good")
    .map((f) => ({
      titel: f.title,
      beschreibung: f.detail,
      prioritaet: f.severity === "critical" ? "hoch" : "mittel",
      kategorie: f.category,
    }));

  const verbesserungen: AnalyseRecommendation[] = [];
  const has = (s: string) => audit.findings.some((f) => f.title.includes(s) && f.severity !== "good");
  if (has("Serverantwort") || has("Ladezeit") || has("Komprimierung")) {
    verbesserungen.push({
      titel: "Performance-Paket: Caching, CDN & Komprimierung",
      beschreibung:
        "Brotli-Komprimierung, Browser-Caching und ein CDN senken die Ladezeit typischerweise um 60–90% — der größte Hebel für Absprungrate und Conversion.",
      aufwand: "mittel",
    });
  }
  if (has("Security") || has("HTTPS") || has("Server verrät")) {
    verbesserungen.push({
      titel: "Security-Härtung",
      beschreibung:
        "Fehlende Schutz-Header setzen, Versionsinfos entfernen und TLS-Konfiguration prüfen — schließt die häufigsten Angriffsflächen in wenigen Tagen.",
      aufwand: "gering",
    });
  }
  if (has("Meta-Description") || has("Seitentitel") || has("H1") || has("Open-Graph")) {
    verbesserungen.push({
      titel: "SEO-Grundgerüst aufbauen",
      beschreibung:
        "Saubere Titles, Descriptions, Überschriften-Struktur und Social-Media-Tags — die Basis, damit Google die Seite versteht und besser rankt.",
      aufwand: "gering",
    });
  }
  if (has("Mobilgeräte") || has("Alt-Texte") || has("Sprache")) {
    verbesserungen.push({
      titel: "Mobile & Accessibility-Optimierung",
      beschreibung:
        "Mobile Darstellung korrigieren und Barrierefreiheit verbessern — über 60% der Besucher kommen über das Smartphone.",
      aufwand: "mittel",
    });
  }
  verbesserungen.push({
    titel: "Conversion-Optimierung auf Ihr Ziel ausrichten",
    beschreibung: goal
      ? `Ihr Ziel „${goal}“ erreichen wir mit klaren Call-to-Actions, Vertrauenselementen und einem optimierten Anfrage-Funnel.`
      : "Klare Call-to-Actions, Vertrauenselemente und ein optimierter Anfrage-Funnel machen aus Besuchern Kunden.",
    aufwand: "mittel",
  });

  const empfehlungen = [
    probleme.some((p) => p.prioritaet === "hoch")
      ? "Zuerst die kritischen Punkte beheben — sie kosten Sie aktuell täglich Besucher, Vertrauen und damit Umsatz."
      : "Die technische Basis ist solide — jetzt gezielt Performance und Conversion ausbauen, um aus mehr Besuchern Kunden zu machen.",
    "Erfolg messbar machen: ein Vorher-Nachher-Report (Ladezeit, Rankings, Anfragen) zeigt Ihnen den Gegenwert schwarz auf weiß.",
    "Im kostenlosen Erstgespräch gehen wir den wichtigsten Hebel konkret mit Ihnen durch — unverbindlich und ohne Verkaufsdruck.",
  ];

  return {
    url: audit.url,
    score: audit.score,
    summary: audit.summary,
    kategorien: categoryScores(audit),
    probleme,
    verbesserungen,
    empfehlungen,
  };
}

/** Ask Claude to turn the technical audit + the visitor's goal into a tailored analysis. */
async function aiAnalyse(audit: AuditResult, goal: string): Promise<AnalyseResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: process.env.AGENCY_AI_MODEL ?? "claude-opus-4-8",
      max_tokens: 4096,
      system:
        "Du bist ein Senior-Webconsultant der Agentur NOREVAN Digital. Aus technischen Audit-Daten machst du eine Website-Analyse, die der Kunde sofort versteht — und die ihn überzeugt, das Potenzial mit uns zu heben. Auf Deutsch, in der Sie-Form.\n\n" +
        "TONFALL & VERKAUF (wichtig):\n" +
        "- Sprich die Sprache des Geldes, nicht die der Technik. Übersetze jeden Befund in eine geschäftliche Folge: verlorene Kunden, weniger Anfragen, schlechtere Google-Position, Umsatz, der täglich liegen bleibt, Vorsprung der Konkurrenz.\n" +
        "- Jede 'beschreibung' nennt zuerst die Folge fürs Geschäft, dann kurz, dass es behebbar ist. Technik-Begriffe nur, wenn unvermeidbar — und dann in einfachen Worten erklärt.\n" +
        "- Die 'summary' ist ein Hook: benenne klar den größten Hebel und mach Lust, ihn zu heben. Mach die 'Kosten des Nichtstuns' spürbar, aber seriös — kein Alarmismus, keine Angstmache.\n" +
        "- Die letzte 'empfehlung' lädt warm zum kostenlosen Erstgespräch ein, ohne Verkaufsdruck.\n" +
        "- EHRLICH & verbindlich: Erfinde keine Preise, Garantien, Kundennamen oder Messwerte, die nicht aus den Audit-Daten stammen. Keine Übertreibung — Vertrauen ist wichtiger als der schnelle Abschluss.\n\n" +
        "Antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown, exakt in diesem Schema: " +
        '{"summary": string, "kategorien": [{"name": string, "score": number}], "probleme": [{"titel": string, "beschreibung": string, "prioritaet": "hoch"|"mittel"|"niedrig", "kategorie": string}], "verbesserungen": [{"titel": string, "beschreibung": string, "aufwand": "gering"|"mittel"|"hoch"}], "empfehlungen": [string]}. ' +
        `Die kategorien müssen genau diese acht Namen verwenden: ${CATEGORY_NAMES.join(", ")}. ` +
        "Maximal 6 probleme, 4 verbesserungen, 3 empfehlungen.",
      messages: [
        {
          role: "user",
          content: `Audit-Daten der Website ${audit.url}:\n${JSON.stringify(
            { score: audit.score, loadTimeMs: audit.loadTimeMs, htmlSizeKb: audit.htmlSizeKb, findings: audit.findings },
          )}\n\nZiel des Besuchers: ${goal || "nicht angegeben"}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") return null;
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return {
      url: audit.url,
      score: audit.score,
      summary: String(parsed.summary ?? audit.summary),
      kategorien: Array.isArray(parsed.kategorien) && parsed.kategorien.length === 8
        ? parsed.kategorien
        : categoryScores(audit),
      probleme: Array.isArray(parsed.probleme) ? parsed.probleme : [],
      verbesserungen: Array.isArray(parsed.verbesserungen) ? parsed.verbesserungen : [],
      empfehlungen: Array.isArray(parsed.empfehlungen) ? parsed.empfehlungen : [],
    };
  } catch (err) {
    console.error("AI analyse failed, falling back to rule-based:", err);
    return null;
  }
}

export async function runAnalyse(rawUrl: string, goal: string): Promise<AnalyseResult> {
  const audit = await runAudit(rawUrl);
  return (await aiAnalyse(audit, goal)) ?? ruleBasedAnalyse(audit, goal);
}
