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

  const filtered = useMemo(() => {
    if (active.size === 0) return products;
    return products.filter((p) => p.categories.some((c) => active.has(c)));
  }, [active, products]);

  function toggle(cat: Category) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
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

      <div className="mb-5 flex flex-wrap items-center gap-1.5 md:mb-8 md:gap-2">
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
      </div>
      <ProductGrid
        products={filtered}
        locale={locale}
        ctaLabel={dict.shop.addToCart}
        emptyLabel={dict.shop.empty}
      />
    </>
  );
}
