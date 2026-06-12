"use client";

import Reveal from "./ui/Reveal";
import CountUp from "./ui/CountUp";
import { useI18n } from "@/lib/i18n";

const numbers = [
  { value: 90, suffix: "%", upTo: true },
  { value: 100, suffix: "%", upTo: false },
  { value: 40, suffix: "+", upTo: false },
  { value: 75, suffix: "+", upTo: false },
];

/** One slim band with the four key numbers — no cards, minimal height. */
export default function StatsStrip() {
  const { t } = useI18n();
  return (
    <section className="relative py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="card-elevated grid grid-cols-2 divide-x-0 divide-y divide-edge !rounded-2xl md:grid-cols-4 md:divide-x md:divide-y-0">
            {numbers.map(({ value, suffix, upTo }, i) => (
              <div key={t.stats.items[i].label} className="px-4 py-5 text-center md:py-6">
                <p className="text-2xl font-bold tracking-tight md:text-3xl">
                  {upTo && (
                    <span className="text-xs font-medium text-ink-muted md:text-sm">
                      {t.stats.prefixUpTo}
                    </span>
                  )}
                  <span className="text-gradient">
                    <CountUp to={value} suffix={suffix} />
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium text-ink-soft md:text-sm">
                  {t.stats.items[i].label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
