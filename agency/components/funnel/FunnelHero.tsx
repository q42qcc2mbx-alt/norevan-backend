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
import { useI18n } from "@/lib/i18n";
import Aurora from "@/components/ui/Aurora";

type Phase = "idle" | "scanning" | "gate" | "submitting" | "success" | "error";

const SCAN_STEP_COUNT = 4;
const TRUST_ICONS = [Lock, ShieldCheck, CheckCircle2];

/** Looks like a valid public web address (loose check; server normalises). */
function looksLikeUrl(value: string): boolean {
  const v = value.trim().replace(/^https?:\/\//i, "");
  return /^[^\s.]+\.[^\s]{2,}/.test(v);
}

/** Blurred, premium-looking report teaser shown behind the e-mail gate. */
function ReportSkeleton() {
  const { t } = useI18n();
  const labels = t.funnel.skeletonLabels;
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
        {labels.map((label, i) => (
          <div key={label}>
            <div className="mb-1 flex justify-between">
              <span className="text-[11px] font-semibold text-ink">{label}</span>
              <span className="text-[11px] text-ink-muted">{"████"}</span>
            </div>
            <div className="h-2 rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-glow"
                style={{ width: `${[58, 34, 71, 46][i] ?? 50}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-page/80 px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-edge backdrop-blur-sm">
          <Lock className="h-3.5 w-3.5" />
          {t.funnel.skeletonBadge}
        </span>
      </div>
    </div>
  );
}

export default function FunnelHero() {
  const { t } = useI18n();
  const f = t.funnel;
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
  const scanRef = useRef<AuditResult | null>(null);
  const errRef = useRef<string | null>(null);
  const doneRef = useRef(false);

  const issues = scan ? scan.findings.filter((x) => x.severity !== "good") : [];
  const criticalCount = issues.filter((x) => x.severity === "critical").length;
  const issueCount = issues.length;

  const startScan = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!looksLikeUrl(url)) {
        setHint(f.urlError);
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
        if (!res.ok) throw new Error(data.error ?? f.scanFailed);
        scanRef.current = data as AuditResult;
        setScan(data as AuditResult);
      } catch {
        errRef.current = f.unreachable;
        setError(f.unreachable);
      } finally {
        doneRef.current = true;
      }
    },
    [url, f],
  );

  useEffect(() => {
    if (phase !== "scanning") return;
    const lastStep = SCAN_STEP_COUNT - 1;

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

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setHint(f.emailError);
      return;
    }
    if (!consent) {
      setHint(f.consentError);
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
      if (!res.ok) throw new Error(data.error ?? f.genericFail);
      setEmailed(Boolean(data.emailed));
      setProgress(100);
      setPhase("success");
    } catch {
      setError(f.genericFail);
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
      ? (criticalCount === 1 ? f.foundCriticalOne : f.foundCriticalMany).replace("{n}", String(criticalCount))
      : issueCount > 0
        ? (issueCount === 1 ? f.foundIssueOne : f.foundIssueMany).replace("{n}", String(issueCount))
        : f.foundStrong;

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-12 md:pt-28 md:pb-16">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="grid-overlay absolute inset-0" aria-hidden />
      <Aurora />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <span
          className="rise inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          {f.badge}
        </span>

        <h1 className="rise-lcp mt-5 font-display text-[1.75rem] leading-[1.15] font-bold tracking-tight text-balance text-ink sm:text-4xl md:text-6xl">
          {f.titleLead} <span className="text-gradient">{f.titleAccent}</span>
        </h1>

        <p className="rise rise-2 mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-xl">
          {f.subtitle}
        </p>

        <form
          onSubmit={startScan}
          className="rise rise-3 mx-auto mt-8 w-full max-w-2xl"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface/80 p-2 shadow-lg backdrop-blur-sm focus-within:border-accent/50 focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] sm:flex-row sm:items-center sm:rounded-full">
            <label htmlFor="funnel-url" className="sr-only">
              {f.urlAria}
            </label>
            <input
              id="funnel-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              maxLength={300}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={f.urlPlaceholder}
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-muted sm:py-4 sm:text-lg"
            />
            <button
              type="submit"
              className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:py-4"
            >
              <ScanSearch className="h-5 w-5" />
              {f.scanCta}
            </button>
          </div>
          {hint && phase === "idle" && (
            <p className="mt-2.5 text-sm font-medium text-amber-600 dark:text-amber-400">{hint}</p>
          )}
        </form>

        <div className="rise rise-4 mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {f.trust.map((label, i) => {
            const Icon = TRUST_ICONS[i] ?? Lock;
            return (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted"
              >
                <Icon className="h-4 w-4 text-accent" />
                {label}
              </span>
            );
          })}
          <span className="text-sm text-ink-muted">· {f.noSignup}</span>
        </div>
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
            aria-label={f.scanCta}
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.21, 0.65, 0.36, 1] }}
              className="card-elevated relative w-full max-w-lg p-6 sm:p-8"
            >
              {phase !== "success" && phase !== "error" && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-muted">
                    <span className="truncate">
                      {f.analyzing} {url.replace(/^https?:\/\//i, "")}
                    </span>
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
                {phase === "scanning" && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 py-2"
                  >
                    {f.scanSteps.map((step, i) => {
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
                          <span className={done || active ? "text-ink" : "text-ink-muted"}>{step}</span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {(phase === "gate" || phase === "submitting") && (
                  <motion.div key="gate" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                        <TriangleAlert className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">{headline}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                          {criticalCount > 0 || issueCount > 0 ? f.gateSubIssues : f.gateSubStrong}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={submitEmail} className="space-y-3">
                      <div className="flex flex-col gap-2.5 sm:flex-row">
                        <label htmlFor="funnel-email" className="sr-only">
                          {f.emailAria}
                        </label>
                        <input
                          id="funnel-email"
                          type="email"
                          autoComplete="email"
                          maxLength={200}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={f.emailPlaceholder}
                          className="field flex-1 !py-3.5 !text-base"
                          autoFocus
                        />
                        <input
                          type="text"
                          name="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          className="sr-only"
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
                              {f.unlock}
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
                          {f.consent}{" "}
                          <a href="/datenschutz" target="_blank" className="text-accent hover:underline">
                            {f.consentLink}
                          </a>
                        </span>
                      </label>

                      {hint && (
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{hint}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                        {f.trust.map((label, i) => {
                          const Icon = TRUST_ICONS[i] ?? Lock;
                          return (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted"
                            >
                              <Icon className="h-3.5 w-3.5 text-accent" />
                              {label}
                            </span>
                          );
                        })}
                        <span className="text-[11px] text-ink-muted">· {f.noSpam}</span>
                      </div>
                    </form>

                    <div className="mt-5">
                      <ReportSkeleton />
                    </div>
                  </motion.div>
                )}

                {phase === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-4 text-center">
                    <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30">
                      <MailCheck className="h-8 w-8" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">{f.successTitle}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                      {emailed ? f.successEmailed : f.successNotEmailed}
                    </p>
                    <button
                      type="button"
                      onClick={reset}
                      className="btn-secondary mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                    >
                      {f.another}
                    </button>
                  </motion.div>
                )}

                {phase === "error" && (
                  <motion.div key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-4 text-center">
                    <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                      <TriangleAlert className="h-8 w-8" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">{f.errorTitle}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{error}</p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                      <button
                        type="button"
                        onClick={reset}
                        className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                      >
                        {f.retry}
                      </button>
                      <a
                        href="/kontakt"
                        className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                      >
                        {f.advice}
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {(phase === "scanning" || phase === "gate") && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 block w-full text-center text-xs text-ink-muted hover:text-ink"
                >
                  {f.cancel}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
