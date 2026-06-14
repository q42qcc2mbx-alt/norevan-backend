"use client";

import { useState } from "react";
import { ChevronDown, ScanSearch } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/ui/Reveal";

// Radical transparency: answer the "where's the catch?" honestly.
const FAQ = [
  {
    q: "Warum macht ihr das gratis? Wo ist der Haken?",
    a: "Ehrlich? Weil es unsere beste Verkaufsmethode ist. Wir könnten Ihnen erzählen, dass wir gut sind — oder wir beweisen es, indem wir Ihre Seite analysieren und echte, umsetzbare Schwachstellen zeigen. Gefällt Ihnen der Report, denken Sie vielleicht an uns, wenn Sie sie beheben wollen. Wenn nicht, behalten Sie einen wertvollen Report. Kein Haken, keine versteckten Kosten.",
  },
  {
    q: "Bekomme ich danach nervige Anrufe?",
    a: "Nein. Sie bekommen Ihren Report per E-Mail. Ob Sie danach mit uns sprechen möchten, entscheiden ausschließlich Sie.",
  },
  {
    q: "Warum nur 10 Analysen pro Monat?",
    a: "Weil wir jede Analyse persönlich prüfen — kein anonymer Massen-Report. Tiefe statt Masse. Deshalb sind die Plätze begrenzt.",
  },
  {
    q: "Ist meine Website-Adresse und E-Mail bei euch sicher?",
    a: "Ja. Alles läuft SSL-verschlüsselt, Ihre Daten liegen auf Servern in der EU und werden ausschließlich für Ihren Report verwendet — vollständig DSGVO-konform. Details in unserer Datenschutzerklärung.",
  },
  {
    q: "Was kostet es, wenn ich danach mit euch arbeite?",
    a: "Das besprechen wir transparent in einem (optionalen) Gespräch — passend zu dem, was Ihre Seite wirklich braucht. Der Report selbst bleibt für Sie kostenlos und unverbindlich.",
  },
];

function scrollToScanner() {
  const field = document.getElementById("funnel-url");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => (field as HTMLInputElement | null)?.focus(), 600);
}

export default function FunnelFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative border-t border-edge bg-card/40 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal className="mb-10 text-center md:mb-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            Ehrliche Antworten
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Keine Marketing-Phrasen. Was Sie wirklich wissen wollen.
          </p>
        </Reveal>

        <div className="space-y-3">
          {FAQ.map(({ q, a }, i) => {
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

        {/* The funnel ends where it began: back to the one input that matters. */}
        <Reveal delay={0.1}>
          <div className="mt-14 text-center">
            <h3 className="font-display text-2xl font-bold tracking-tight text-balance text-ink md:text-3xl">
              Bereit? In 30 Sekunden wissen Sie mehr.
            </h3>
            <button
              type="button"
              onClick={scrollToScanner}
              className="btn-primary mt-6 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
            >
              <ScanSearch className="h-5 w-5" />
              Website jetzt kostenlos scannen
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
