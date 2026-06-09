"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  CATEGORIES,
  type Brand,
  type Category,
  type Product,
} from "@/lib/products-types";
import { ProductGrid } from "./ProductGrid";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { cn } from "@/lib/cn";

const BRAND_LABEL: Record<Brand, string> = {
  nike: "Nike",
  adidas: "Adidas",
  "polo-ralph-lauren": "Polo Ralph Lauren",
  "ami-paris": "Ami Paris",
  generic: "STRDX",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export function ShopBrowser({
  products,
  locale,
  dict,
  activeBrand,
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
  activeBrand?: Brand | null;
}) {
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [sizes, setSizes] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const availableSizes = useMemo(() => {
    const s = new Set<string>();
    for (const p of products) (p.sizes ?? []).forEach((z) => s.add(z));
    return Array.from(s).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.localeCompare(b);
    });
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = products;
    if (active.size > 0) {
      base = base.filter((p) => p.categories.some((c) => active.has(c)));
    }
    if (q) {
      base = base.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (BRAND_LABEL[p.brand] ?? p.brand).toLowerCase().includes(q),
      );
    }
    if (sizes.size > 0) {
      base = base.filter((p) => (p.sizes ?? []).some((z) => sizes.has(z)));
    }
    if (sort === "price-asc") return [...base].sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-desc") return [...base].sort((a, b) => b.priceCents - a.priceCents);
    return base;
  }, [active, products, sort, sizes, query]);

  function toggle(cat: Category) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleSize(size: string) {
    setSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  return (
    <>
      {activeBrand && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {dict.shop.brandLabel}:
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-background">
            {BRAND_LABEL[activeBrand]}
            <Link
              href={`/${locale}/shop`}
              aria-label={dict.shop.clearBrand}
              className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-background hover:bg-background hover:text-foreground"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </Link>
          </span>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === "de" ? "Suchen (Name oder Marke)…" : "Search (name or brand)…"}
          aria-label={locale === "de" ? "Produkte suchen" : "Search products"}
          className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm focus:border-foreground focus:outline-none"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5 md:gap-2">
        <button
          type="button"
          onClick={() => setActive(new Set())}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-[11px] font-medium transition-colors md:px-4 md:py-1.5 md:text-xs",
            active.size === 0
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted-bg",
          )}
        >
          {dict.shop.filterAll}
        </button>
        {CATEGORIES.map((cat) => {
          const on = active.has(cat);
          return (
            <motion.button
              key={cat}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(cat)}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-[11px] font-medium transition-colors md:px-4 md:py-1.5 md:text-xs",
                on
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted-bg",
              )}
            >
              {dict.categories[cat]}
            </motion.button>
          );
        })}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label={locale === "de" ? "Sortierung" : "Sort"}
          className="ml-auto rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium md:py-1.5 md:text-xs"
        >
          <option value="featured">{locale === "de" ? "Empfohlen" : "Featured"}</option>
          <option value="price-asc">{locale === "de" ? "Preis ↑" : "Price ↑"}</option>
          <option value="price-desc">{locale === "de" ? "Preis ↓" : "Price ↓"}</option>
        </select>
      </div>

      {/* Size filter */}
      {availableSizes.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-1.5 md:mb-8 md:gap-2">
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
            {locale === "de" ? "Größe" : "Size"}
          </span>
          {availableSizes.map((z) => {
            const on = sizes.has(z);
            return (
              <button
                key={z}
                type="button"
                onClick={() => toggleSize(z)}
                className={cn(
                  "min-w-9 rounded-full border border-border px-3 py-1 text-[11px] font-medium tabular-nums transition-colors md:text-xs",
                  on ? "bg-accent text-accent-foreground" : "hover:bg-muted-bg",
                )}
              >
                {z}
              </button>
            );
          })}
          {sizes.size > 0 && (
            <button
              type="button"
              onClick={() => setSizes(new Set())}
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted underline-offset-2 hover:text-foreground hover:underline"
            >
              {locale === "de" ? "zurücksetzen" : "reset"}
            </button>
          )}
        </div>
      )}

      <ProductGrid
        products={filtered}
        locale={locale}
        ctaLabel={dict.shop.addToCart}
        emptyLabel={dict.shop.empty}
      />
    </>
  );
}
