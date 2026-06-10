"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Gauge, Lock, TrendingUp } from "lucide-react";

const badges = [
  { icon: Gauge, label: "Ladezeiten unter 1s" },
  { icon: Lock, label: "Security nach Best Practice" },
  { icon: TrendingUp, label: "Messbar mehr Conversions" },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.21, 0.65, 0.36, 1] as const },
  });

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36">
      <div className="aurora absolute inset-0" aria-hidden />
      <div className="grid-overlay absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-5 text-center md:px-8">
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            Jetzt freie Kapazitäten für neue Projekte
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.12)}
          className="mt-7 text-4xl leading-[1.08] font-bold tracking-tight text-balance md:text-6xl lg:text-7xl"
        >
          <span className="text-gradient">
            Wir verwandeln Ihre Website in eine schnelle, sichere und
            leistungsstarke Plattform.
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.24)}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-2xl"
        >
          Mehr Geschwindigkeit. Mehr Sicherheit. Mehr Kunden.
        </motion.p>

        <motion.div
          {...fadeUp(0.36)}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#analyse"
            className="btn-primary group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white"
          >
            Kostenlose Analyse anfordern
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#leistungen"
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/[0.03] px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur transition-colors hover:border-accent/40 hover:text-white"
          >
            Unsere Leistungen
          </a>
        </motion.div>

        <motion.div
          {...fadeUp(0.5)}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {badges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400"
            >
              <Icon className="h-4 w-4 text-accent-soft" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
