"use client";

import { motion, AnimatePresence } from "motion/react";
import type { Locale } from "@/lib/i18n/config";

// Reference size charts. Apparel = chest/length in cm; sneaker = EU → US/cm.
const APPAREL_ROWS: { size: string; chest: string; length: string }[] = [
  { size: "XS", chest: "86–91", length: "66" },
  { size: "S", chest: "91–97", length: "69" },
  { size: "M", chest: "97–102", length: "72" },
  { size: "L", chest: "102–107", length: "74" },
  { size: "XL", chest: "107–112", length: "76" },
];

const SNEAKER_ROWS: { size: string; us: string; cm: string }[] = [
  { size: "40", us: "7", cm: "25.0" },
  { size: "41", us: "8", cm: "25.5" },
  { size: "42", us: "8.5", cm: "26.5" },
  { size: "43", us: "9.5", cm: "27.5" },
  { size: "44", us: "10", cm: "28.0" },
  { size: "45", us: "11", cm: "29.0" },
  { size: "46", us: "11.5", cm: "29.5" },
];

export function SizeGuideModal({
  open,
  onClose,
  locale,
  variant,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  variant: "apparel" | "sneaker";
}) {
  const t =
    locale === "de"
      ? {
          title: "Größentabelle",
          note: "Maße in cm. Im Zweifel die größere Größe wählen.",
          close: "Schließen",
          apparel: ["Größe", "Brust", "Länge"],
          sneaker: ["EU", "US", "Fußlänge"],
        }
      : {
          title: "Size guide",
          note: "Measurements in cm. When in doubt, size up.",
          close: "Close",
          apparel: ["Size", "Chest", "Length"],
          sneaker: ["EU", "US", "Foot length"],
        };

  const headers = variant === "sneaker" ? t.sneaker : t.apparel;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">{t.title}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <table className="mt-5 w-full text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-border">
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variant === "sneaker"
                  ? SNEAKER_ROWS.map((r) => (
                      <tr key={r.size} className="border-b border-border-subtle">
                        <td className="py-2.5 font-medium">{r.size}</td>
                        <td className="py-2.5 text-muted">{r.us}</td>
                        <td className="py-2.5 text-muted">{r.cm} cm</td>
                      </tr>
                    ))
                  : APPAREL_ROWS.map((r) => (
                      <tr key={r.size} className="border-b border-border-subtle">
                        <td className="py-2.5 font-medium">{r.size}</td>
                        <td className="py-2.5 text-muted">{r.chest} cm</td>
                        <td className="py-2.5 text-muted">{r.length} cm</td>
                      </tr>
                    ))}
              </tbody>
            </table>

            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">
              {t.note}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
