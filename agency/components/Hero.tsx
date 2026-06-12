"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const trustIcons = [Gauge, ShieldCheck, Search];

/** Stylised audit dashboard — pure CSS/SVG, no image assets. */
function HeroVisual() {
  const { t } = useI18n();
  return (
    <div className="card-elevated overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-edge bg-card px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 hidden flex-1 items-center rounded-md bg-surface px-3 py-1 text-xs text-ink-muted ring-1 ring-edge sm:flex">
          {t.hero.visualUrl}
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-6">
        {/* Score ring */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
              <circle cx="56" cy="56" r="46" fill="none" stroke="var(--t-edge)" strokeWidth="9" />
              <motion.circle
                cx="56"
                cy="56"
                r="46"
                fill="none"
                stroke="url(#hero-ring)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 * 0.04 }}
                transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-ink">96</span>
              <span className="text-[10px] font-medium tracking-widest text-ink-muted uppercase">
                {t.hero.visualScore}
              </span>
            </div>
          </div>
          <span className="text-xs font-medium text-ink-muted">{t.hero.visualAfter}</span>
        </div>

        {/* Metrics */}
        <div className="space-y-3.5">
          {[
            { label: t.hero.visualMetrics[0], before: "4,8s", after: "0,7s", width: "92%" },
            { label: t.hero.visualMetrics[1], before: "C", after: "A+", width: "100%" },
            { label: t.hero.visualMetrics[2], before: "32", after: "94", width: "88%" },
          ].map(({ label, before, after, width }, i) => (
            <div key={label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold text-ink">{label}</span>
                <span className="text-xs text-ink-muted">
                  <s className="opacity-60">{before}</s>
                  <span className="mx-1.5">→</span>
                  <span className="font-bold text-accent">{after}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-edge">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-glow"
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 1.1, delay: 0.7 + i * 0.15, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-1.5">
            {t.hero.visualChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3 w-3" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease: [0.21, 0.65, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden pt-24 pb-10 md:pt-40 md:pb-24">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="grid-overlay absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="text-center lg:text-left">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-6xl"
          >
            {t.hero.title}{" "}
            <span className="text-gradient">{t.hero.titleAccent}</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl lg:mx-0"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            {...fadeUp(0.3)}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              href="/analyse"
              className="btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
            >
              {t.hero.ctaAnalyse}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/kontakt"
              className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
            >
              {t.hero.ctaProject}
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp(0.42)}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 lg:justify-start"
          >
            {t.hero.trust.map((label, i) => {
              const Icon = trustIcons[i];
              return (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted"
              >
                <Icon className="h-4 w-4 text-accent" />
                {label}
              </span>
            );})}
          </motion.div>
        </div>

        <motion.div
          className="hidden md:block"
          initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.25, ease: [0.21, 0.65, 0.36, 1] }}
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
