"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCart, cartCount, cartSubtotalCents } from "@/lib/cart-store";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

export function CartDrawer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const count = cartCount(items);
  const subtotal = cartSubtotalCents(items);
  const freeShippingAt = 10000; // €100
  const remainingForFree = Math.max(0, freeShippingAt - subtotal);
  const freeShippingProgress = Math.min(1, subtotal / freeShippingAt);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
          />
          <motion.aside
            role="dialog"
            aria-label={dict.cart.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background"
          >
            <header className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
              <div className="flex items-baseline gap-3">
                <span
                  className="font-serif text-xl"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Nor<em className="not-italic" style={{ color: "var(--gold)" }}>e</em>van
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
                  {dict.cart.title} · {count}
                </span>
              </div>
              <button
                onClick={close}
                aria-label="close"
                className="grid h-8 w-8 place-items-center rounded-full text-foreground hover:bg-muted-bg"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            {/* Free shipping progress bar */}
            {items.length > 0 && (
              <div className="border-b border-border-subtle bg-background-soft px-6 py-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                  {remainingForFree > 0 ? (
                    <>
                      <span>
                        {locale === "de" ? "Noch" : "Just"}{" "}
                        <span className="text-foreground">
                          {formatPrice(remainingForFree, locale)}
                        </span>{" "}
                        {locale === "de" ? "bis Versand frei" : "for free shipping"}
                      </span>
                      <span>{Math.round(freeShippingProgress * 100)}%</span>
                    </>
                  ) : (
                    <span className="text-foreground">
                      ✓ {locale === "de" ? "Versand frei" : "Free shipping unlocked"}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-px w-full overflow-hidden bg-border">
                  <motion.div
                    className="h-full bg-foreground"
                    initial={false}
                    animate={{ scaleX: freeShippingProgress }}
                    style={{ transformOrigin: "0% 50%" }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Image
                    src="/logo/norevan.png"
                    alt=""
                    width={120}
                    height={60}
                    className="mb-6 h-12 w-auto opacity-90"
                    aria-hidden
                  />
                  <span className="eyebrow">{locale === "de" ? "Leer" : "Empty"}</span>
                  <p
                    className="mt-3 max-w-xs font-serif italic"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                      lineHeight: 1.15,
                    }}
                  >
                    {dict.cart.empty}
                  </p>
                  <p className="body-soft mt-3 max-w-xs text-sm leading-[1.65]">
                    {locale === "de"
                      ? "Stöbere durch die kuratierten Stücke und füge etwas hinzu."
                      : "Browse the curated picks and add something in."}
                  </p>
                  <Link
                    href={`/${locale}/shop`}
                    onClick={close}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-background"
                  >
                    {dict.cart.emptyCta} <span aria-hidden>→</span>
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={`${item.slug}-${item.size ?? ""}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 border-b border-border-subtle py-4 last:border-0"
                      >
                        <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-muted-bg">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/${locale}/shop/${item.slug}`}
                            onClick={close}
                            className="text-sm font-medium leading-tight hover:underline"
                          >
                            {item.name}
                          </Link>
                          {item.size && (
                            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                              {dict.cart.size} · {item.size}
                            </span>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="inline-flex items-center border border-border">
                              <button
                                onClick={() => setQty(item.slug, item.qty - 1, item.size)}
                                className="px-3 py-1 text-sm hover:bg-muted-bg"
                                aria-label="-"
                              >
                                −
                              </button>
                              <span className="min-w-7 px-2 text-center font-mono text-[11px]">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => setQty(item.slug, item.qty + 1, item.size)}
                                className="px-3 py-1 text-sm hover:bg-muted-bg"
                                aria-label="+"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm tabular-nums">
                              {formatPrice(item.priceCents * item.qty, locale)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => remove(item.slug, item.size)}
                          aria-label={dict.cart.remove}
                          className="self-start text-muted hover:text-foreground"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border-subtle px-6 py-5">
                <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                  <span>{dict.cart.subtotal}</span>
                  <span
                    className="font-serif text-xl normal-case tracking-normal text-foreground"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {formatPrice(subtotal, locale)}
                  </span>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
                  {locale === "de"
                    ? "Versand wird im Checkout berechnet. Demo-Modus."
                    : "Shipping calculated at checkout. Demo mode."}
                </p>
                <Link
                  href={`/${locale}/checkout`}
                  onClick={close}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
                >
                  {dict.cart.checkout}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href={`/${locale}/cart`}
                  onClick={close}
                  className="mt-3 block text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted underline-offset-4 hover:text-foreground hover:underline"
                >
                  {locale === "de" ? "Warenkorb ansehen" : "View cart"}
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
