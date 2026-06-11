"use client";

import { Gauge, ShieldCheck, Search, Sparkles, TrendingUp, Wrench } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const icons = [Gauge, ShieldCheck, Search, Sparkles, TrendingUp, Wrench];

export default function WhyUs() {
  const { t } = useI18n();
  return (
    <section id="warum-wir" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.whyus.eyebrow} title={t.whyus.title} subtitle={t.whyus.subtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.whyus.items.map(({ title, text }, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={title} delay={i * 0.06}>
                <article className="card h-full p-7">
                  <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
