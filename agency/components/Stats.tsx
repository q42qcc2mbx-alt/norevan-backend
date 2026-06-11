"use client";

import { Gauge, ShieldCheck, Smile, Trophy } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import CountUp from "./ui/CountUp";
import { useI18n } from "@/lib/i18n";

const numbers = [
  { icon: Gauge, value: 90, suffix: "%", upTo: true },
  { icon: ShieldCheck, value: 100, suffix: "%", upTo: false },
  { icon: Smile, value: 40, suffix: "+", upTo: false },
  { icon: Trophy, value: 75, suffix: "+", upTo: false },
];

export default function Stats() {
  const { t } = useI18n();
  return (
    <section id="ergebnisse" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.stats.eyebrow} title={t.stats.title} subtitle={t.stats.subtitle} />
        <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {numbers.map(({ icon: Icon, value, suffix, upTo }, i) => (
            <Reveal key={t.stats.items[i].label} delay={i * 0.07}>
              <article className="card h-full p-5 text-center sm:p-7">
                <span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {upTo && (
                    <span className="text-sm font-medium text-ink-muted sm:text-base">
                      {t.stats.prefixUpTo}
                    </span>
                  )}
                  <span className="text-gradient">
                    <CountUp to={value} suffix={suffix} />
                  </span>
                </p>
                <h3 className="mt-2.5 text-sm font-semibold text-ink sm:text-base">
                  {t.stats.items[i].label}
                </h3>
                <p className="mt-1.5 hidden text-sm leading-relaxed text-ink-soft sm:block">
                  {t.stats.items[i].detail}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
