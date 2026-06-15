"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, RadarIcon, ShieldCheck } from "lucide-react";

// Live security check inside the portal: scans the customer's real website via
// the existing /api/audit (SSL, HSTS, CSP, clickjacking, mixed content, server
// version …) and shows an honest security grade A–D with what's protected vs.
// vulnerable. Real data only — and a natural upsell to the security package.

interface Finding {
  category: string;
  severity: "critical" | "warning" | "good";
  title: string;
  detail: string;
}

type Grade = "A" | "B" | "C" | "D";

function gradeFor(sec: Finding[]): Grade {
  const crit = sec.filter((f) => f.severity === "critical").length;
  const warn = sec.filter((f) => f.severity === "warning").length;
  if (crit >= 2) return "D";
  if (crit === 1) return "C";
  if (warn === 0) return "A";
  return warn === 1 ? "B" : "C";
}

const GRADE_STYLE: Record<Grade, { ring: string; text: string; label: string }> = {
  A: { ring: "from-emerald-500 to-emerald-600", text: "text-emerald-600 dark:text-emerald-400", label: "Sehr gut geschützt" },
  B: { ring: "from-lime-500 to-emerald-500", text: "text-lime-600 dark:text-lime-400", label: "Gut, mit Luft nach oben" },
  C: { ring: "from-amber-500 to-orange-500", text: "text-amber-600 dark:text-amber-400", label: "Handlungsbedarf" },
  D: { ring: "from-red-500 to-rose-600", text: "text-red-600 dark:text-red-400", label: "Dringender Handlungsbedarf" },
};

export default function SecurityCheck({ defaultUrl = "" }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sec, setSec] = useState<Finding[] | null>(null);

  async function scan(e: React.FormEvent) {
    e.preventDefault();
    const target = url.trim();
    if (!target || loading) return;
    setLoading(true);
    setError("");
    setSec(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Die Seite konnte nicht geprüft werden.");
        return;
      }
      const findings: Finding[] = (data.findings ?? []).filter(
        (f: Finding) => f.category === "Sicherheit",
      );
      setSec(findings);
    } catch {
      setError("Verbindungsfehler — bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  const grade = sec ? gradeFor(sec) : null;
  const good = sec?.filter((f) => f.severity === "good") ?? [];
  const issues = sec?.filter((f) => f.severity !== "good") ?? [];

  return (
    <div className="card-elevated p-6 md:p-7">
      <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
          <RadarIcon className="h-4.5 w-4.5" />
        </span>
        Live-Sicherheits-Check Ihrer Website
      </h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        Prüfen Sie in Echtzeit, wie gut Ihre Seite gegen Angriffe, Datendiebstahl und
        Vertrauensverlust geschützt ist.
      </p>

      <form onSubmit={scan} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ihre-website.de"
          maxLength={300}
          className="field flex-1"
          aria-label="Website-URL für den Sicherheits-Check"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {loading ? "Prüfe …" : "Sicherheit prüfen"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

      {sec && grade && (
        <div className="mt-6">
          {/* Grade */}
          <div className="flex items-center gap-4">
            <span
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${GRADE_STYLE[grade].ring} font-display text-3xl font-bold text-white shadow-lg`}
            >
              {grade}
            </span>
            <div>
              <p className={`font-display text-lg font-bold ${GRADE_STYLE[grade].text}`}>
                {GRADE_STYLE[grade].label}
              </p>
              <p className="text-sm text-ink-soft">
                {issues.length === 0
                  ? "Keine Sicherheits-Schwachstellen gefunden — stark!"
                  : `${issues.length} ${issues.length === 1 ? "Punkt" : "Punkte"} mit Handlungsbedarf gefunden.`}
              </p>
            </div>
          </div>

          {/* Protected */}
          {good.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold tracking-wide text-ink-muted uppercase">Geschützt</p>
              <ul className="space-y-2">
                {good.map((f) => (
                  <li key={f.title} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {issues.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold tracking-wide text-ink-muted uppercase">
                Schwachstellen
              </p>
              <ul className="space-y-2.5">
                {issues.map((f) => (
                  <li
                    key={f.title}
                    className="rounded-xl border border-edge bg-card p-3.5"
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <AlertTriangle
                        className={`h-4 w-4 shrink-0 ${f.severity === "critical" ? "text-red-500" : "text-amber-500"}`}
                      />
                      {f.title}
                    </p>
                    <p className="mt-1 pl-6 text-xs leading-relaxed text-ink-muted">{f.detail}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/anfrage"
                className="btn-primary mt-4 inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                Schwachstellen beheben lassen
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
