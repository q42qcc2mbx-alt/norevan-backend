"use client";

import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";

// Renders a stored analysis result. Handles BOTH shapes:
//  • Funnel audit:  { score, summary, findings:[{category,severity,title,detail}] }
//  • KI analyse:    { score, summary, kategorien, probleme, verbesserungen, empfehlungen }

interface Finding {
  category?: string;
  severity?: string;
  title?: string;
  detail?: string;
}
interface Problem {
  titel?: string;
  beschreibung?: string;
  prioritaet?: string;
  kategorie?: string;
}
interface Improvement {
  titel?: string;
  beschreibung?: string;
  aufwand?: string;
}
interface Category {
  name?: string;
  score?: number;
}
interface StoredResult {
  url?: string;
  score?: number;
  summary?: string;
  findings?: Finding[];
  kategorien?: Category[];
  probleme?: Problem[];
  verbesserungen?: Improvement[];
  empfehlungen?: string[];
  performance?: { score?: number; lcpMs?: number; cls?: number; tbtMs?: number };
}

function sevClass(sev?: string) {
  if (sev === "critical" || sev === "hoch") return "bg-red-500/10 text-red-600 ring-red-500/30 dark:text-red-400";
  if (sev === "warning" || sev === "mittel") return "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400";
  return "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400";
}

export default function ReportDetail({ result, className = "" }: { result: unknown; className?: string }) {
  const r = (result && typeof result === "object" ? result : {}) as StoredResult;
  const findings = (r.findings ?? []).filter((f) => f.severity !== "good");
  const probleme = r.probleme ?? [];
  const verbesserungen = r.verbesserungen ?? [];
  const empfehlungen = r.empfehlungen ?? [];
  const kategorien = r.kategorien ?? [];

  const hasContent =
    findings.length || probleme.length || verbesserungen.length || empfehlungen.length || r.summary;
  if (!hasContent) {
    return <p className={`text-sm text-ink-soft ${className}`}>Für diese Analyse liegen keine Detaildaten vor.</p>;
  }

  const perf = r.performance;

  return (
    <div className={`space-y-5 text-left ${className}`}>
      {r.summary && <p className="text-sm leading-relaxed text-ink-soft">{r.summary}</p>}

      {perf && typeof perf.score === "number" && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-edge bg-card p-3.5">
          <span className="text-xs font-bold tracking-wide text-ink-muted uppercase">Google-Performance (mobil):</span>
          <span
            className={`text-sm font-bold ${
              perf.score >= 90 ? "text-emerald-500" : perf.score >= 50 ? "text-amber-500" : "text-red-500"
            }`}
          >
            {perf.score}/100
          </span>
          {perf.lcpMs != null && <span className="text-xs text-ink-soft">· LCP {(perf.lcpMs / 1000).toFixed(1)}s</span>}
          {perf.cls != null && <span className="text-xs text-ink-soft">· CLS {perf.cls.toFixed(2)}</span>}
          {perf.tbtMs != null && <span className="text-xs text-ink-soft">· TBT {Math.round(perf.tbtMs)}ms</span>}
        </div>
      )}

      {kategorien.length > 0 && (
        <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {kategorien.map((k) => (
            <div key={k.name}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-medium text-ink">{k.name}</span>
                <span className="text-xs font-bold text-ink-soft">{k.score}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-edge">
                <div
                  className={`h-full rounded-full ${
                    (k.score ?? 0) >= 75 ? "bg-emerald-500" : (k.score ?? 0) >= 45 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${k.score ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Funnel-audit findings OR analyse problems */}
      {(findings.length > 0 || probleme.length > 0) && (
        <div>
          <h4 className="mb-2.5 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Gefundene Punkte
          </h4>
          <ul className="space-y-2.5">
            {findings.map((f, i) => (
              <li key={`f-${i}`} className="rounded-xl border border-edge bg-card p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{f.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${sevClass(f.severity)}`}>
                    {f.category}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{f.detail}</p>
              </li>
            ))}
            {probleme.map((p, i) => (
              <li key={`p-${i}`} className="rounded-xl border border-edge bg-card p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{p.titel}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${sevClass(p.prioritaet)}`}>
                    {p.kategorie}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{p.beschreibung}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {verbesserungen.length > 0 && (
        <div>
          <h4 className="mb-2.5 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
            <Sparkles className="h-4 w-4 text-accent" />
            Empfohlene Verbesserungen
          </h4>
          <ul className="space-y-2.5">
            {verbesserungen.map((v, i) => (
              <li key={i} className="rounded-xl border border-accent/20 bg-accent/[0.04] p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{v.titel}</span>
                  {v.aufwand && (
                    <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-edge">
                      Aufwand: {v.aufwand}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{v.beschreibung}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {empfehlungen.length > 0 && (
        <div>
          <h4 className="mb-2.5 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Unsere Empfehlung
          </h4>
          <ul className="space-y-2">
            {empfehlungen.map((e, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
