"use client";

import Link from "next/link";
import { ArrowRight, ScanSearch } from "lucide-react";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

export default function CtaBanner() {
  const { t } = useI18n();
  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-deep px-6 py-10 text-center shadow-xl shadow-accent/25 md:px-12 md:py-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_80%_0%,rgba(6,182,212,0.35),transparent)]"
              aria-hidden
            />
            <h2 className="relative text-2xl font-bold tracking-tight text-balance text-white md:text-4xl">
              {t.cta.title}
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base text-blue-100 md:text-lg">
              {t.cta.subtitle}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/analyse"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-accent-deep shadow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                <ScanSearch className="h-5 w-5" />
                {t.cta.analyse}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                {t.cta.project}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
