"use client";

import { motion } from "motion/react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";

export function ProductGrid({
  products,
  locale,
  ctaLabel,
  emptyLabel,
}: {
  products: Product[];
  locale: Locale;
  ctaLabel: string;
  emptyLabel: string;
}) {
  if (products.length === 0) {
    return (
      <div className="grid place-items-center py-24">
        <p className="text-muted">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product, i) => (
        <motion.div
          key={product.slug}
          layout
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: Math.min(i * 0.04, 0.4),
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          <ProductCard
            product={product}
            locale={locale}
            ctaLabel={ctaLabel}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
