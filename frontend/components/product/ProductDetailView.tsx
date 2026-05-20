"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { ExplodingInfoLazy } from "@/components/three/ExplodingInfoLazy";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

const BRAND_LABEL: Record<string, string> = {
  nike: "Nike",
  adidas: "Adidas",
  "polo-ralph-lauren": "Polo Ralph Lauren",
  "ami-paris": "Ami Paris",
  generic: "Norevan",
};

export function ProductDetailView({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const [size, setSize] = useState<string | undefined>();
  const [view, setView] = useState<"gallery" | "exploding">("gallery");
  const [openSection, setOpenSection] = useState<"details" | "shipping" | "auth">(
    "details",
  );
  const [wishlisted, setWishlisted] = useState(false);

  const needsSize = !!product.sizes && product.sizes.length > 0;

  const sections = [
    {
      id: "details" as const,
      label: dict.pdp.description,
      body: <p className="body-soft text-sm leading-[1.65]">{product.description[locale]}</p>,
    },
    {
      id: "shipping" as const,
      label: locale === "de" ? "Versand & Retoure" : "Shipping & returns",
      body: (
        <p className="body-soft text-sm leading-[1.65]">
          {locale === "de"
            ? "Kostenloser Versand in DE/AT/CH ab 100 €. 30 Tage Rückgabe. Wir verschicken aus Berlin innerhalb von 24 Stunden."
            : "Free shipping in DE/AT/CH from €100. 30-day returns. Shipped from Berlin within 24 hours."}
        </p>
      ),
    },
    {
      id: "auth" as const,
      label: locale === "de" ? "Echtheit" : "Authenticity",
      body: (
        <p className="body-soft text-sm leading-[1.65]">
          {locale === "de"
            ? "Jedes Produkt wird durch unser Atelier verifiziert — Material, Verarbeitung, Provenienz. Du bekommst nur Original-Ware."
            : "Every piece is verified by our atelier — material, craftsmanship, provenance. Only original goods reach your door."}
        </p>
      ),
    },
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        {/* View toggle */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setView("gallery")}
            className={cn(
              "font-mono text-[9px] uppercase tracking-[0.2em] transition-colors",
              view === "gallery"
                ? "text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {locale === "de" ? "Galerie" : "Gallery"}
          </button>
          <span className="text-border" aria-hidden>
            /
          </span>
          <button
            type="button"
            onClick={() => setView("exploding")}
            className={cn(
              "font-mono text-[9px] uppercase tracking-[0.2em] transition-colors",
              view === "exploding"
                ? "text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            3D
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {view === "gallery" ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ProductGallery images={product.images} tapHint={dict.pdp.tapHint} />
            </motion.div>
          ) : (
            <motion.div
              key="exploding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ExplodingInfoLazy product={product} locale={locale} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spec strip below gallery on desktop */}
        <div className="mt-8 hidden border-y border-border-subtle py-5 md:grid md:grid-cols-3 md:gap-6">
          {product.specs.slice(0, 3).map((spec) => (
            <div key={spec.label.de} className="text-left">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                {spec.label[locale]}
              </div>
              <div className="mt-1 text-sm text-foreground">
                {spec.value[locale]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky aside on desktop */}
      <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          {BRAND_LABEL[product.brand] ?? product.brand}
        </span>
        <h1
          className="headline mt-3"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
        >
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-xl font-medium tabular-nums">
            {formatPrice(product.priceCents, locale)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {locale === "de" ? "inkl. MwSt." : "incl. VAT"}
          </span>
        </div>

        <p className="body-soft mt-6 max-w-md text-[15px] leading-[1.65]">
          {product.description[locale]}
        </p>

        {needsSize && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{dict.pdp.sizeLabel}</span>
              <button
                type="button"
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                {locale === "de" ? "Größentabelle" : "Size guide"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {product.sizes!.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    s === size
                      ? "border border-foreground bg-foreground text-background"
                      : "border border-border text-foreground hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <AddToCartButton
            item={{
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              image: product.images[0].src,
            }}
            needsSize={needsSize}
            size={size}
            label={dict.pdp.addToCart}
            sizeRequiredLabel={dict.pdp.sizeRequired}
            className="h-12 flex-1"
          />
          <motion.button
            type="button"
            onClick={() => setWishlisted((v) => !v)}
            whileTap={{ scale: 0.95 }}
            aria-label={locale === "de" ? "Zur Wunschliste" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={cn(
              "grid h-12 w-12 place-items-center rounded-full border transition-colors",
              wishlisted
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-foreground",
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={wishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Trust label={locale === "de" ? "Versand" : "Shipping"} value={locale === "de" ? "Frei ab 100 €" : "Free over €100"} />
          <Trust label={locale === "de" ? "Retoure" : "Returns"} value={locale === "de" ? "30 Tage" : "30 days"} />
          <Trust label={locale === "de" ? "Atelier" : "Atelier"} value={locale === "de" ? "Verifiziert" : "Verified"} />
        </div>

        <div className="mt-12 border-t border-border-subtle">
          {sections.map((s) => (
            <Accordion
              key={s.id}
              label={s.label}
              open={openSection === s.id}
              onToggle={() =>
                setOpenSection(openSection === s.id ? "details" : s.id)
              }
            >
              {s.body}
            </Accordion>
          ))}
        </div>

        {/* Specs (full list) */}
        <div className="mt-8 border-t border-border-subtle pt-8">
          <span className="eyebrow">{dict.pdp.specs}</span>
          <dl className="mt-4 divide-y divide-border-subtle text-sm">
            {product.specs.map((spec) => (
              <div
                key={spec.label.de}
                className="flex justify-between gap-4 py-3"
              >
                <dt className="text-muted">{spec.label[locale]}</dt>
                <dd className="text-foreground">{spec.value[locale]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Trust({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle px-3 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div className="mt-0.5 text-xs text-foreground">{value}</div>
    </div>
  );
}

function Accordion({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground">
          {label}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-lg leading-none text-foreground/60"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
