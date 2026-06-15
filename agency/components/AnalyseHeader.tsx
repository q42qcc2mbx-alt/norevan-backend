"use client";

import { Gauge, Lock, ScanSearch, Smartphone } from "lucide-react";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const checkIcons = [Gauge, Lock, ScanSearch, Smartphone];

export default function AnalyseHeader() {
  const { t } = useI18n();
  return (
    <Reveal className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
      <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase">
        {t.analyse.eyebrow}
      </span>
      <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-ink sm:text-3xl md:text-5xl">
        {t.analyse.title} <span className="text-gradient">{t.analyse.titleAccent}</span>
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">
        {t.analyse.subtitle}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
        {t.analyse.checks.map((label, i) => {
          const Icon = checkIcons[i];
          return (
            <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </span>
          );
        })}
      </div>
    </Reveal>
  );
}
