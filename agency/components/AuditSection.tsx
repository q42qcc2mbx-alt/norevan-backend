"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ScanSearch,
  Send,
  ShieldAlert,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

interface Finding {
  category: string;
  severity: "critical" | "warning" | "good";
  title: string;
  detail: string;
}

interface AuditResult {
  url: string;
  score: number;
  loadTimeMs: number;
  htmlSizeKb: number;
  findings: Finding[];
  summary: string;
}

const severityStyles = {
  critical: {
    icon: ShieldAlert,
    chip: "bg-red-50 text-red-600 ring-red-200",
    label: "Kritisch",
  },
  warning: {
    icon: AlertTriangle,
    chip: "bg-amber-50 text-amber-600 ring-amber-200",
    label: "Warnung",
  },
  good: {
    icon: CheckCircle2,
    chip: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    label: "Gut",
  },
} as const;

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
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
        <span className="text-[11px] tracking-widest text-ink-muted uppercase">
          von 100
        </span>
      </div>
    </div>
  );
}

export default function AuditSection() {
  const [form, setForm] = useState({ name: "", email: "", url: "", message: "" });
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLeadSent(false);
    setPhase("scanning");

    // Send the lead and run the audit in parallel — the inquiry must not
    // get lost just because the visitor's site is unreachable.
    const leadPromise = fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        website: form.url,
        message: form.message || "Anfrage über kostenlose Website-Analyse.",
      }),
    })
      .then((r) => r.ok)
      .catch(() => false);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analyse fehlgeschlagen.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse fehlgeschlagen.");
    } finally {
      setLeadSent(await leadPromise);
      setPhase("done");
    }
  }

  return (
    <section id="analyse" className="relative py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_50%,rgba(37,99,235,0.05),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Kostenlose Website-Prüfung"
          title="Was bremst Ihre Website? Finden Sie es jetzt heraus."
          subtitle="Unser KI-gestütztes Audit prüft Ihre Website in Sekunden auf Performance, Sicherheit, SEO und Nutzererfahrung — kostenlos und unverbindlich."
        />

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Form */}
          <Reveal>
            <form
              onSubmit={handleSubmit}
              className="card-elevated p-6 sm:p-8"
              aria-label="Kostenlose Website-Analyse anfordern"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="audit-name" className="mb-1.5 block text-sm font-medium text-ink">
                    Name
                  </label>
                  <input
                    id="audit-name"
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
                <div className="sm:col-span-1">
                  <label htmlFor="audit-email" className="mb-1.5 block text-sm font-medium text-ink">
                    E-Mail
                  </label>
                  <input
                    id="audit-email"
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
                  <label htmlFor="audit-url" className="mb-1.5 block text-sm font-medium text-ink">
                    Website-URL
                  </label>
                  <input
                    id="audit-url"
                    type="text"
                    required
                    maxLength={300}
                    inputMode="url"
                    value={form.url}
                    onChange={update("url")}
                    placeholder="www.ihre-website.de"
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="audit-message" className="mb-1.5 block text-sm font-medium text-ink">
                    Nachricht <span className="font-normal text-ink-muted">(optional)</span>
                  </label>
                  <textarea
                    id="audit-message"
                    rows={4}
                    maxLength={5000}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Worum geht es bei Ihrem Projekt?"
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
                    <ScanSearch className="h-5 w-5" />
                    Jetzt kostenlos analysieren
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-ink-muted">
                100% kostenlos & unverbindlich. Ihre Daten werden DSGVO-konform
                verarbeitet und niemals weitergegeben.
              </p>

              {phase === "done" && leadSent && (
                <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Anfrage erhalten — wir melden uns innerhalb von 24 Stunden.
                </p>
              )}
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
                    <h3 className="text-lg font-semibold text-ink">
                      Ihr KI-Audit erscheint hier
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-ink-soft">
                      Performance, Sicherheit, SEO und UX — wir zeigen Ihnen in
                      Sekunden, wo Ihre Website Potenzial verschenkt.
                    </p>
                  </motion.div>
                )}

                {phase === "scanning" && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"
                  >
                    <div className="relative mb-6 h-20 w-20">
                      <span className="absolute inset-0 animate-ping rounded-full bg-accent/15" />
                      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/25">
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-ink">
                      KI analysiert Ihre Website …
                    </h3>
                    <p className="mt-2 text-sm text-ink-soft">
                      Wir prüfen Ladezeit, Security-Header, SEO-Signale und mehr.
                    </p>
                  </motion.div>
                )}

                {phase === "done" && error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"
                  >
                    <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-200">
                      <AlertTriangle className="h-8 w-8" />
                    </span>
                    <h3 className="text-lg font-semibold text-ink">
                      Analyse nicht möglich
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-ink-soft">{error}</p>
                  </motion.div>
                )}

                {phase === "done" && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex flex-col items-center gap-6 sm:flex-row">
                      <ScoreRing score={result.score} />
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-ink">
                          Audit-Ergebnis
                        </h3>
                        <p className="mt-1 text-xs break-all text-ink-muted">{result.url}</p>
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                          {result.summary}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-7 max-h-72 space-y-3 overflow-y-auto pr-1">
                      {result.findings.map((f) => {
                        const s = severityStyles[f.severity];
                        const Icon = s.icon;
                        return (
                          <li
                            key={`${f.category}-${f.title}`}
                            className="rounded-xl border border-edge bg-card p-4"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4.5 w-4.5 shrink-0 text-ink-muted" />
                              <span className="text-sm font-semibold text-ink">
                                {f.title}
                              </span>
                              <span
                                className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${s.chip}`}
                              >
                                {s.label}
                              </span>
                            </div>
                            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                              {f.detail}
                            </p>
                          </li>
                        );
                      })}
                    </ul>

                    <a
                      href="#kontakt"
                      className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                    >
                      <Send className="h-4 w-4" />
                      Probleme jetzt beheben lassen
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
