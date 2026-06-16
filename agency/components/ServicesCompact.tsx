"use client";

import Link from "next/link";
import { ArrowRight, Bot, Code2, Rocket, ShieldCheck } from "lucide-react";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const icons = [Code2, Rocket, ShieldCheck, Bot];

/** Compact 4-tile overview for the home page — details live on /leistungen. */
export default function ServicesCompact() {
  const { t } = useI18n();
  return (
    <section className="relative py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {t.services.items.map(({ title }, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={title} delay={i * 0.05}>
                <Link
                  href="/leistungen"
                  className="card-surface group flex h-full items-center gap-3 !rounded-2xl p-4 md:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow text-white shadow-md shadow-accent/25 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-snug font-semibold text-ink">
                    {title}
                  </span>
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-ink-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent sm:block rtl:rotate-180" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
