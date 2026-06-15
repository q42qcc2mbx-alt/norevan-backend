"use client";

import { TrendingDown, Clock, Trophy } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

// The "Cost of Inaction" — speaks only the language of money, no tech jargon.
const ICONS = [Clock, TrendingDown, Trophy];

export default function CostOfInaction() {
  const { t } = useI18n();
  const p = t.funnel.pain;

  return (
    <section className="relative border-t border-edge bg-card/40 py-14 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center md:mb-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            {p.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">{p.subtitle}</p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {p.cards.map((c, i) => {
            const Icon = ICONS[i] ?? Clock;
            return (
              <Reveal key={c.title} delay={i * 0.1}>
                <div className="card-surface h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-5 font-display text-2xl font-bold text-ink">{c.stat}</p>
                  <h3 className="mt-1 text-base font-semibold text-ink">{c.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-base leading-relaxed text-ink-soft">
            {p.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
