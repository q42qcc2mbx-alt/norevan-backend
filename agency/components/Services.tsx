"use client";

import Link from "next/link";
import { ArrowRight, Bot, Code2, Rocket, ShieldCheck } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const icons = [Code2, Rocket, ShieldCheck, Bot];

export default function Services() {
  const { t } = useI18n();
  return (
    <section id="leistungen" className="relative bg-card py-12 md:py-24">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          subtitle={t.services.subtitle}
        />
        <div className="grid gap-5 md:grid-cols-2">
          {t.services.items.map(({ title, text, points }, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={title} delay={(i % 2) * 0.08}>
                <article className="card-surface group h-full p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow text-white shadow-md shadow-accent/25 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink md:text-xl">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-2 border-t border-edge pt-5">
                    {points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5 text-sm text-ink-soft">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/kontakt"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
                  >
                    {t.services.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
