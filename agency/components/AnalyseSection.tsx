"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Loader2,
  ScanSearch,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import Reveal from "./ui/Reveal";

interface AnalyseResult {
  url: string;
  score: number;
  summary: string;
  kategorien: { name: string; score: number }[];
  probleme: { titel: string; beschreibung: string; prioritaet: string; kategorie: string }[];
  verbesserungen: { titel: string; beschreibung: string; aufwand: string }[];
  empfehlungen: string[];
}

const prioStyles: Record<string, string> = {
  hoch: "bg-red-500/10 text-red-600 ring-red-500/30 dark:text-red-400",
  mittel: "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400",
  niedrig: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
};

const SCAN_STEPS = [
  "Website wird geladen …",
  "Performance & Ladezeit werden gemessen …",
  "Sicherheits-Header werden geprüft …",
  "SEO & Struktur werden analysiert …",
  "Mobile Optimierung wird bewertet …",
  "KI erstellt Ihre Empfehlungen …",
];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--t-edge)" strokeWidth="10" />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-ink">{score}</span>
        <span className="text-[11px] tracking-widest text-ink-muted uppercase">von 100</span>
      </div>
    </div>
  );
}

function ScanProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
      <div className="relative mb-6 h-20 w-20">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/15" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/25">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </span>
      </div>
      <h3 className="text-lg font-semibold text-ink">KI analysiert Ihre Website …</h3>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-2 text-sm text-ink-soft"
        >
          {SCAN_STEPS[step]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function AnalyseSection() {
  const [form, setForm] = useState({ name: "", email: "", url: "", goal: "" });
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<AnalyseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setPhase("scanning");

    let userId: string | undefined;
    try {
      const { data } = await getSupabase().auth.getSession();
      userId = data.session?.user.id;
    } catch {
      /* not logged in */
    }

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analyse fehlgeschlagen.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse fehlgeschlagen.");
    } finally {
      setPhase("done");
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-8">
      {/* Form */}
      <Reveal>
        <form
          onSubmit={handleSubmit}
          className="card-elevated p-6 sm:p-8"
          aria-label="Kostenlose KI-Website-Analyse anfordern"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="an-name" className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="an-name"
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                value={form.name}
                onChange={update("name")}
                placeholder="Max Mustermann"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="an-email" className="mb-1.5 block text-sm font-medium text-ink">
                E-Mail
              </label>
              <input
                id="an-email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                placeholder="max@firma.de"
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="an-url" className="mb-1.5 block text-sm font-medium text-ink">
                Website-Link
              </label>
              <input
                id="an-url"
                type="text"
                required
                maxLength={300}
                inputMode="url"
                value={form.url}
                onChange={update("url")}
                placeholder="https://example.com"
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="an-goal" className="mb-1.5 block text-sm font-medium text-ink">
                Was soll verbessert werden?{" "}
                <span className="font-normal text-ink-muted">(Ihr Ziel)</span>
              </label>
              <textarea
                id="an-goal"
                rows={3}
                maxLength={2000}
                value={form.goal}
                onChange={update("goal")}
                placeholder="z. B. Mehr Kunden gewinnen, schnellere Ladezeiten, besseres Google-Ranking …"
                className="field resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={phase === "scanning"}
            className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {phase === "scanning" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyse läuft …
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                KI-Analyse starten
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-ink-muted">
            100% kostenlos & unverbindlich. Mit{" "}
            <Link href="/registrieren" className="font-medium text-accent hover:underline">
              kostenlosem Konto
            </Link>{" "}
            finden Sie Ihre Analysen jederzeit im Dashboard wieder.
          </p>
        </form>
      </Reveal>

      {/* Result panel */}
      <Reveal delay={0.1}>
        <div className="card-elevated min-h-[420px] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"
              >
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <ScanSearch className="h-8 w-8" />
                </span>
                <h3 className="text-lg font-semibold text-ink">Ihre KI-Analyse erscheint hier</h3>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  Design, Geschwindigkeit, SEO, Mobile, Sicherheit,
                  Benutzerfreundlichkeit, Conversion und Struktur — mit
                  konkreten Empfehlungen und Prioritäten.
                </p>
              </motion.div>
            )}

            {phase === "scanning" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ScanProgress />
              </motion.div>
            )}

            {phase === "done" && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"
              >
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                  <AlertTriangle className="h-8 w-8" />
                </span>
                <h3 className="text-lg font-semibold text-ink">Analyse nicht möglich</h3>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">{error}</p>
                <Link
                  href="/kontakt"
                  className="btn-secondary mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  Persönlich beraten lassen
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}

            {phase === "done" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-7"
              >
                {/* Score + summary */}
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <ScoreRing score={result.score} />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-ink">Ihr Analyse-Ergebnis</h3>
                    <p className="mt-1 text-xs break-all text-ink-muted">{result.url}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{result.summary}</p>
                  </div>
                </div>

                {/* Category bars */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
                    <ListChecks className="h-4 w-4 text-accent" />
                    Bewertung nach Bereichen
                  </h4>
                  <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {result.kategorien.map((k, i) => (
                      <div key={k.name}>
                        <div className="mb-1 flex items-baseline justify-between">
                          <span className="text-xs font-medium text-ink">{k.name}</span>
                          <span className="text-xs font-bold text-ink-soft">{k.score}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-edge">
                          <motion.div
                            className={`h-full rounded-full ${
                              k.score >= 75 ? "bg-emerald-500" : k.score >= 45 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${k.score}%` }}
                            transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problems */}
                {result.probleme.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      Gefundene Probleme
                    </h4>
                    <ul className="space-y-2.5">
                      {result.probleme.map((p) => (
                        <li key={p.titel} className="rounded-xl border border-edge bg-card p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{p.titel}</span>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                                prioStyles[p.prioritaet] ?? prioStyles.mittel
                              }`}
                            >
                              {p.prioritaet === "hoch" ? "Priorität: Hoch" : p.prioritaet === "niedrig" ? "Niedrig" : "Mittel"}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{p.beschreibung}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {result.verbesserungen.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Empfohlene Verbesserungen
                    </h4>
                    <ul className="space-y-2.5">
                      {result.verbesserungen.map((v) => (
                        <li key={v.titel} className="rounded-xl border border-accent/20 bg-accent/[0.04] p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{v.titel}</span>
                            <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-edge">
                              Aufwand: {v.aufwand}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{v.beschreibung}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.empfehlungen.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Unsere Empfehlung
                    </h4>
                    <ul className="space-y-2">
                      {result.empfehlungen.map((e) => (
                        <li key={e} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href="/kontakt"
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                >
                  <Send className="h-4 w-4" />
                  Probleme jetzt beheben lassen
                </Link>
                <p className="!mt-3 text-center text-xs text-ink-muted">
                  Ihre Analyse wurde gespeichert — wir melden uns innerhalb von 24 Stunden mit konkreten Vorschlägen.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </div>
  );
}
