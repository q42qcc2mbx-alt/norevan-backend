"use client";

import { Code2, Palette, ShieldCheck, TrendingUp } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

// Trust without anonymity — shown by discipline, not by name. Icons & gradients
// stay in code; the role labels come from i18n.
const VISUALS = [
  { icon: Code2, gradient: "from-blue-500 to-indigo-500" },
  { icon: Palette, gradient: "from-cyan-500 to-blue-500" },
  { icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500" },
  { icon: TrendingUp, gradient: "from-violet-500 to-purple-500" },
];

export default function FounderTeam() {
  const { t } = useI18n();
  const f = t.funnel.founders;

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            {f.title} <span className="text-gradient">{f.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            {f.subtitle}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-8">
          {f.roles.map((role, i) => {
            const v = VISUALS[i] ?? VISUALS[0];
            const Icon = v.icon;
            return (
              <Reveal key={role} delay={i * 0.08}>
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${v.gradient} text-white shadow-lg ring-4 ring-page md:h-24 md:w-24`}
                    aria-hidden
                  >
                    <Icon className="h-9 w-9" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-ink md:text-base">{role}</h3>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <blockquote className="mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-ink-soft italic md:text-xl">
            {f.quote}
          </blockquote>
          <p className="mt-3 font-display font-semibold text-ink">{f.quoteBy}</p>
        </Reveal>
      </div>
    </section>
  );
}
