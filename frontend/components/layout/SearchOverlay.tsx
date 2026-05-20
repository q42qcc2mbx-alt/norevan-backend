"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";

const RECENT: Record<Locale, string[]> = {
  de: ["Nike Tech Fleece", "Polo Ralph Lauren", "Baggy Jeans", "Sneaker"],
  en: ["Nike Tech Fleece", "Polo Ralph Lauren", "Baggy Jeans", "Sneakers"],
};

const SUGGESTIONS: Record<Locale, string[]> = {
  de: ["Streetwear SS26", "Atelier-Auswahl", "Schmuck", "Herrenmode"],
  en: ["Streetwear SS26", "Atelier picks", "Jewelry", "Menswear"],
};

export function SearchOverlay({
  open,
  onClose,
  locale,
  products,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  products: Product[];
}) {
  const [q, setQ] = useState("");
  const router = useRouter();

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const matches = useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!v) return products.slice(0, 6);
    return products
      .filter((p) =>
        [
          p.name,
          p.brand,
          p.categories.join(" "),
          p.description[locale],
        ]
          .join(" ")
          .toLowerCase()
          .includes(v),
      )
      .slice(0, 8);
  }, [q, products, locale]);

  function go(slug: string) {
    onClose();
    router.push(`/${locale}/shop/${slug}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-2xl"
          role="dialog"
          aria-label="search"
        >
          <div className="mx-auto flex h-full max-w-5xl flex-col px-6 py-6 md:px-10">
            {/* Top bar */}
            <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches[0]) go(matches[0].slug);
                }}
                placeholder={
                  locale === "de" ? "Suche nach Marke, Produkt…" : "Search brand, product…"
                }
                className="font-serif text-2xl flex-1 bg-transparent placeholder:text-muted focus:outline-none md:text-3xl"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              />
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] hover:bg-muted-bg"
              >
                ESC
              </button>
            </div>

            <div className="mt-8 grid flex-1 gap-10 overflow-auto md:grid-cols-12">
              {/* Suggestions / recent (only visible without query) */}
              {!q && (
                <div className="md:col-span-4">
                  <div className="mb-3">
                    <span className="eyebrow">
                      {locale === "de" ? "Letzte Suchen" : "Recent"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {RECENT[locale].map((r) => (
                      <li key={r}>
                        <button
                          onClick={() => setQ(r)}
                          className="text-left text-base text-foreground hover:underline"
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-3 mt-10">
                    <span className="eyebrow">
                      {locale === "de" ? "Vorschläge" : "Suggestions"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {SUGGESTIONS[locale].map((s) => (
                      <li key={s}>
                        <button
                          onClick={() => setQ(s)}
                          className="text-left text-base text-foreground hover:underline"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Matches */}
              <div className={q ? "md:col-span-12" : "md:col-span-8"}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="eyebrow">
                    {q
                      ? locale === "de"
                        ? `Ergebnisse für „${q}"`
                        : `Results for "${q}"`
                      : locale === "de"
                        ? "Empfohlen"
                        : "Featured"}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                    {matches.length} {locale === "de" ? "Treffer" : "matches"}
                  </span>
                </div>
                {matches.length === 0 ? (
                  <p className="body-soft py-12 text-center text-sm">
                    {locale === "de"
                      ? "Keine Treffer. Versuche eine andere Suche."
                      : "No matches. Try a different query."}
                  </p>
                ) : (
                  <ul className="grid gap-4 md:grid-cols-2">
                    {matches.map((p) => (
                      <li key={p.slug}>
                        <button
                          onClick={() => go(p.slug)}
                          className="group flex w-full gap-4 border-b border-border-subtle py-4 text-left"
                        >
                          <div className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-sm bg-muted-bg">
                            <Image
                              src={p.images[0].src}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                              {p.brand.replace(/-/g, " ")}
                            </span>
                            <span className="mt-1 text-sm font-medium text-foreground group-hover:underline">
                              {p.name}
                            </span>
                            <span className="mt-auto pt-2 text-sm tabular-nums text-foreground">
                              {formatPrice(p.priceCents, locale)}
                            </span>
                          </div>
                          <span
                            aria-hidden
                            className="self-center text-lg text-muted transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                          >
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-border-subtle pt-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              <Link href={`/${locale}/shop`} onClick={onClose} className="hover:text-foreground">
                {locale === "de" ? "Alle Produkte ansehen" : "Browse all products"} →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
