"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

export default function Faq() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />
        <div className="space-y-3">
          {t.faq.items.map(({ q, a }, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={q} delay={i * 0.04}>
                <div className="card-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                  >
                    <span className="text-base font-semibold text-ink">{q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-accent transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
