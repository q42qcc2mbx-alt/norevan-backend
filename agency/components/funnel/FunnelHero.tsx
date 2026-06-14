"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  MailCheck,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { AuditResult } from "@/lib/audit";

type Phase = "idle" | "scanning" | "gate" | "submitting" | "success" | "error";

const SCAN_STEPS = [
  "Scanne DOM-Struktur …",
  "Messe Ladezeit & Performance …",
  "Identifiziere Conversion-Killer …",
  "Prüfe Darstellung auf Smartphones …",
];

const TRUST = [
  { icon: Lock, label: "SSL-verschlüsselt" },
  { icon: ShieldCheck, label: "Server in der EU" },
  { icon: CheckCircle2, label: "DSGVO-konform" },
];

/** Looks like a valid public web address (loose check; server normalises). */
function looksLikeUrl(value: string): boolean {
  const v = value.trim().replace(/^https?:\/\//i, "");
  return /^[^\s.]+\.[^\s]{2,}/.test(v);
}

/** Blurred, premium-looking report teaser shown behind the e-mail gate. */
function ReportSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-edge bg-card p-5">
      <div aria-hidden className="space-y-3.5 blur-[5px] select-none">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-cyan-glow" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 rounded bg-edge" />
            <div className="h-2.5 w-1/3 rounded bg-edge" />
          </div>
          <div className="text-2xl font-bold text-ink">{"•••"}</div>
        </div>
        {["Performance-Score", "Conversion-Leck #1", "Umsatz-Impact", "Mobile-Darstellung"].map(
          (label, i) => (
            <div key={label}>
              <div className="mb-1 flex justify-between">
                <span className="text-[11px] font-semibold text-ink">{label}</span>
                <span className="text-[11px] text-ink-muted">{"████"}</span>
              </div>
              <div className="h-2 rounded-full bg-edge">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-glow"
                  style={{ width: `${[58, 34, 71, 46][i]}%` }}
                />
              </div>
            </div>
          ),
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-page/80 px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-edge backdrop-blur-sm">
          <Lock className="h-3.5 w-3.5" />
          Vollständiger Report
        </span>
      </div>
    </div>
  );
}

export default function FunnelHero() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [scan, setScan] = useState<AuditResult | null>(null);
  const [emailed, setEmailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  // Refs let the scan animation read the latest async result without re-running
  // the effect (and without synchronous setState in the effect body).
  const scanRef = useRef<AuditResult | null>(null);
  const errRef = useRef<string | null>(null);
  const doneRef = useRef(false);

  const issues = scan ? scan.findings.filter((f) => f.severity !== "good") : [];
  const criticalCount = issues.filter((f) => f.severity === "critical").length;
  const issueCount = issues.length;

  // --- Step 1 → 2: kick off the REAL scan + start the progress animation -----
  const startScan = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!looksLikeUrl(url)) {
        setHint("Bitte geben Sie eine gültige Website-Adresse ein (z. B. ihre-firma.de).");
        return;
      }
      setHint(null);
      setError(null);
      setScan(null);
      scanRef.current = null;
      errRef.current = null;
      doneRef.current = false;
      setProgress(0);
      setStepIndex(0);
      setPhase("scanning");

      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Die Website konnte nicht gescannt werden.");
        scanRef.current = data as AuditResult;
        setScan(data as AuditResult);
      } catch (err) {
        errRef.current =
          err instanceof Error
            ? err.message
            : "Die Website konnte nicht erreicht werden. Bitte prüfen Sie die Adresse.";
        setError(errRef.current);
      } finally {
        doneRef.current = true;
      }
    },
    [url],
  );

  // Drive the bar to 80% + cycle the step labels, then hold until the real scan
  // resolves and reveal the gate (or the error). All setState lives inside timer
  // callbacks — never synchronously in the effect body.
  useEffect(() => {
    if (phase !== "scanning") return;
    const lastStep = SCAN_STEPS.length - 1;

    const advance = () => {
      if (doneRef.current) setPhase(errRef.current ? "error" : "gate");
    };

    if (reduceMotion) {
      const id = setInterval(() => {
        setProgress(80);
        setStepIndex(lastStep);
        advance();
      }, 150);
      return () => clearInterval(id);
    }

    // Hold the bar at 80% (concept: stop at 80, *then* reveal the count) and
    // only advance once the real scan has also resolved.
    let current = 0;
    const bar = setInterval(() => {
      current = Math.min(80, current + 2);
      setProgress(current);
      if (current >= 80) advance();
    }, 90);
    const steps = setInterval(() => setStepIndex((s) => Math.min(s + 1, lastStep)), 1100);
    return () => {
      clearInterval(bar);
      clearInterval(steps);
    };
  }, [phase, reduceMotion]);

  // --- Step 3: capture the e-mail, store the lead, send the report -----------
  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setHint("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!consent) {
      setHint("Bitte bestätigen Sie kurz, dass wir Ihnen den Report senden dürfen.");
      return;
    }
    setHint(null);
    setError(null);
    setPhase("submitting");
    setProgress(92);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email, consent, company, scan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Das hat leider nicht geklappt.");
      setEmailed(Boolean(data.emailed));
      setProgress(100);
      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das hat leider nicht geklappt.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setProgress(0);
    setScan(null);
    setError(null);
    setHint(null);
    scanRef.current = null;
    errRef.current = null;
    doneRef.current = false;
  }

  const headline =
    criticalCount > 0
      ? `${criticalCount} kritische ${criticalCount === 1 ? "Schwachstelle" : "Schwachstellen"} gefunden.`
      : issueCount > 0
        ? `${issueCount} ${issueCount === 1 ? "Schwachstelle" : "Schwachstellen"} mit Umsatz-Potenzial gefunden.`
        : "Ihre Seite ist technisch stark — wir zeigen Ihnen den Feinschliff.";

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-16 md:pt-28">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="grid-overlay absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Limitiert: nur 10 Tiefen-Analysen pro Monat
        </motion.span>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-6 font-display text-4xl leading-[1.08] font-bold tracking-tight text-balance text-ink md:text-6xl"
        >
          Ihre Website verliert gerade Kunden.{" "}
          <span className="text-gradient">Sehen Sie in 30 Sekunden, wie viele.</span>
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl"
        >
          Kostenlose KI-gestützte Analyse. Kein Verkaufsgespräch, keine Verpflichtung — nur ein
          ehrlicher Report, der zeigt, wo Ihnen Umsatz durch die Finger rinnt.
        </motion.p>

        {/* The dominant, single-purpose input */}
        <motion.form
          onSubmit={startScan}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mx-auto mt-8 w-full max-w-2xl"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface/80 p-2 shadow-lg backdrop-blur-sm focus-within:border-accent/50 focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] sm:flex-row sm:items-center sm:rounded-full">
            <label htmlFor="funnel-url" className="sr-only">
              Ihre Website-Adresse
            </label>
            <input
              id="funnel-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              maxLength={300}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ihre-website.de"
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-muted sm:py-4 sm:text-lg"
            />
            <button
              type="submit"
              className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:py-4"
            >
              <ScanSearch className="h-5 w-5" />
              Jetzt kostenlos scannen
            </button>
          </div>
          {hint && phase === "idle" && (
            <p className="mt-2.5 text-sm font-medium text-amber-600 dark:text-amber-400">{hint}</p>
          )}
        </motion.form>

        {/* Micro-trust directly under the field */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {TRUST.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted"
            >
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </span>
          ))}
          <span className="text-sm text-ink-muted">· keine Anmeldung nötig</span>
        </motion.div>
      </div>

      {/* Steps 2 + 3: full-screen funnel overlay */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-page/80 px-4 py-8 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Website-Analyse"
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.21, 0.65, 0.36, 1] }}
              className="card-elevated relative w-full max-w-lg p-6 sm:p-8"
            >
              {/* Progress bar (shared across scanning / gate / submitting) */}
              {phase !== "success" && phase !== "error" && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-muted">
                    <span className="truncate">Analysiere {url.replace(/^https?:\/\//i, "")}</span>
                    <span>{Math.round(progress)} %</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-edge">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-glow"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut", duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* SCANNING */}
                {phase === "scanning" && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 py-2"
                  >
                    {SCAN_STEPS.map((step, i) => {
                      const active = i === stepIndex;
                      const done = i < stepIndex;
                      return (
                        <div
                          key={step}
                          className={`flex items-center gap-3 text-sm transition-opacity ${
                            i <= stepIndex ? "opacity-100" : "opacity-35"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                          ) : active ? (
                            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />
                          ) : (
                            <span className="h-5 w-5 shrink-0 rounded-full border border-edge" />
                          )}
                          <span className={done || active ? "text-ink" : "text-ink-muted"}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* E-MAIL GATE */}
                {(phase === "gate" || phase === "submitting") && (
                  <motion.div
                    key="gate"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                        <TriangleAlert className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">{headline}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                          {criticalCount > 0 || issueCount > 0
                            ? "Mindestens eine davon kostet Sie wahrscheinlich täglich Kunden. Wohin sollen wir Ihren vollständigen Report senden?"
                            : "Wir senden Ihnen den vollständigen Report mit dem letzten Conversion-Potenzial. Wohin?"}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={submitEmail} className="space-y-3">
                      <div className="flex flex-col gap-2.5 sm:flex-row">
                        <label htmlFor="funnel-email" className="sr-only">
                          Ihre E-Mail-Adresse
                        </label>
                        <input
                          id="funnel-email"
                          type="email"
                          autoComplete="email"
                          maxLength={200}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ihre@email.de"
                          className="field flex-1 !py-3.5 !text-base"
                          autoFocus
                        />
                        {/* Honeypot */}
                        <input
                          type="text"
                          name="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          className="absolute -left-[9999px] h-0 w-0 opacity-0"
                        />
                        <button
                          type="submit"
                          disabled={phase === "submitting"}
                          className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {phase === "submitting" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Report freischalten
                              <ArrowRight className="h-5 w-5" />
                            </>
                          )}
                        </button>
                      </div>

                      <label className="flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-ink-muted">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                        />
                        <span>
                          Ja, senden Sie mir meinen kostenlosen Report. Ich kann der Nutzung
                          jederzeit widersprechen.{" "}
                          <a href="/datenschutz" target="_blank" className="text-accent hover:underline">
                            Datenschutz
                          </a>
                        </span>
                      </label>

                      {hint && (
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          {hint}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                        {TRUST.map(({ icon: Icon, label }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted"
                          >
                            <Icon className="h-3.5 w-3.5 text-accent" />
                            {label}
                          </span>
                        ))}
                        <span className="text-[11px] text-ink-muted">· kein Spam, Abmeldung mit 1 Klick</span>
                      </div>
                    </form>

                    <div className="mt-5">
                      <ReportSkeleton />
                    </div>
                  </motion.div>
                )}

                {/* SUCCESS */}
                {phase === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4 text-center"
                  >
                    <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30">
                      <MailCheck className="h-8 w-8" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">Geschafft!</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                      {emailed
                        ? "Ihr Report ist unterwegs — prüfen Sie Ihr Postfach (auch den Spam-Ordner). Wir haben Ihnen die wichtigste Schwachstelle rot markiert."
                        : "Wir haben Ihre Anfrage erhalten und melden uns in Kürze persönlich mit Ihrem vollständigen Report."}
                    </p>
                    <button
                      type="button"
                      onClick={reset}
                      className="btn-secondary mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                    >
                      Weitere Website prüfen
                    </button>
                  </motion.div>
                )}

                {/* ERROR */}
                {phase === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4 text-center"
                  >
                    <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                      <TriangleAlert className="h-8 w-8" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">Kurz hakt es …</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                      {error ?? "Etwas ist schiefgelaufen."}
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                      <button
                        type="button"
                        onClick={reset}
                        className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                      >
                        Erneut versuchen
                      </button>
                      <a
                        href="/kontakt"
                        className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                      >
                        Persönlich beraten lassen
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Allow escape from the overlay before committing */}
              {(phase === "scanning" || phase === "gate") && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 block w-full text-center text-xs text-ink-muted hover:text-ink"
                >
                  Abbrechen
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
