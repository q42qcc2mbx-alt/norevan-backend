"use client";

import { Star } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const visuals = [
  { initials: "SB", gradient: "from-blue-500 to-indigo-500" },
  { initials: "DK", gradient: "from-cyan-500 to-blue-500" },
  { initials: "MH", gradient: "from-emerald-500 to-teal-500" },
];

export default function Testimonials() {
  const { t } = useI18n();
  return (
    <section id="kunden" className="relative bg-card py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          subtitle={t.testimonials.subtitle}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {t.testimonials.items.map(({ name, role, quote }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <figure className="card-surface flex h-full flex-col p-7">
                <div className="mb-4 flex gap-1" aria-label={t.testimonials.stars}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">
                  „{quote}“
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5 border-t border-edge pt-5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${visuals[i].gradient} text-sm font-bold text-white shadow-md`}
                    aria-hidden
                  >
                    {visuals[i].initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <p className="text-xs text-ink-muted">{role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
