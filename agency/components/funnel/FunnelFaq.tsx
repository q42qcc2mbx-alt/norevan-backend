"use client";

import { useState } from "react";
import { ChevronDown, ScanSearch } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

function scrollToScanner() {
  const field = document.getElementById("funnel-url");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => (field as HTMLInputElement | null)?.focus(), 600);
}

export default function FunnelFaq() {
  const { t } = useI18n();
  const f = t.funnel.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative border-t border-edge bg-card/40 py-14 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal className="mb-8 text-center md:mb-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            {f.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{f.subtitle}</p>
        </Reveal>

        <div className="space-y-3">
          {f.items.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={q} delay={i * 0.05}>
                <div className="card-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-ink">{q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-accent transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 text-center">
            <h3 className="font-display text-2xl font-bold tracking-tight text-balance text-ink md:text-3xl">
              {f.ctaTitle}
            </h3>
            <button
              type="button"
              onClick={scrollToScanner}
              className="btn-primary mt-6 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
            >
              <ScanSearch className="h-5 w-5" />
              {f.ctaButton}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
