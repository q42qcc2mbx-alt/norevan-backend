"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const faqs = [
  {
    q: "Was kostet die Website-Analyse?",
    a: "Nichts. Die KI-Analyse und das anschließende Erstgespräch sind komplett kostenlos und unverbindlich. Sie erhalten einen klaren Überblick über Schwachstellen und Potenziale — was Sie damit machen, entscheiden Sie.",
  },
  {
    q: "Wie lange dauert eine Website-Optimierung?",
    a: "Gezielte Performance- oder Security-Optimierungen setzen wir meist innerhalb von 1–2 Wochen um. Ein komplettes Redesign dauert je nach Umfang 4–8 Wochen. Sie erhalten vorab einen verbindlichen Zeitplan.",
  },
  {
    q: "Muss meine Website während der Arbeiten offline gehen?",
    a: "Nein. Wir arbeiten auf einer Staging-Umgebung und schalten Änderungen erst live, wenn alles getestet ist. Ihre Website bleibt durchgehend erreichbar.",
  },
  {
    q: "Mit welchen Technologien arbeitet ihr?",
    a: "Wir setzen auf moderne, bewährte Technologien wie Next.js, React und TypeScript — und optimieren ebenso bestehende Systeme wie WordPress, Shopify oder individuelle Lösungen. Die Technologie folgt Ihrem Ziel, nicht umgekehrt.",
  },
  {
    q: "Wie messt ihr den Erfolg?",
    a: "Vor Projektstart erfassen wir den Ist-Zustand: Ladezeiten, Core Web Vitals, Rankings, Conversion-Rate. Nach der Umsetzung erhalten Sie einen Vorher-Nachher-Report mit allen Kennzahlen — transparent und nachvollziehbar.",
  },
  {
    q: "Bietet ihr auch laufende Betreuung an?",
    a: "Ja. Mit unseren Wartungspaketen kümmern wir uns um Updates, Sicherheit, Backups und Monitoring — und sind da, wenn Sie uns brauchen. So bleibt Ihre Website dauerhaft schnell und sicher.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading eyebrow="FAQ" title="Häufige Fragen, klare Antworten." />
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={q} delay={i * 0.04}>
                <div className="card-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
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
                        <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">
                          {a}
                        </p>
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
