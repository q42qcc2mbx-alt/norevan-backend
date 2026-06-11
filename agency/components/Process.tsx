"use client";

import { ClipboardCheck, MessagesSquare, Rocket, Wrench } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const icons = [ClipboardCheck, MessagesSquare, Wrench, Rocket];

export default function Process() {
  const { t } = useI18n();
  return (
    <section id="ablauf" className="relative bg-card py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.process.eyebrow} title={t.process.title} subtitle={t.process.subtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map(({ title, text }, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={title} delay={i * 0.08}>
                <article className="card-surface relative h-full p-7">
                  <span className="absolute end-6 top-6 text-3xl font-bold text-edge select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
