"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  locale,
  ctaLabel,
  className,
}: {
  product: Product;
  locale: Locale;
  ctaLabel: string;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const primary = product.images[0];
  const secondary = product.images[1] ?? primary;

  return (
    <motion.article
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("group relative flex flex-col", className)}
    >
      <Link
        href={`/${locale}/shop/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-muted-bg"
        aria-label={product.name}
      >
        <motion.div
          animate={{ scale: hover ? 1.03 : 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={secondary.src}
            alt={secondary.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </motion.div>
      </Link>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {product.brand.replace(/-/g, " ")}
          </span>
          <Link
            href={`/${locale}/shop/${product.slug}`}
            className="mt-1 block truncate text-sm font-medium text-foreground hover:underline"
          >
            {product.name}
          </Link>
        </div>
        <span className="whitespace-nowrap pt-4 text-sm tabular-nums text-foreground">
          {formatPrice(product.priceCents, locale)}
        </span>
      </div>

      <Link
        href={`/${locale}/shop/${product.slug}`}
        className={cn(
          "mt-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-all duration-300",
          hover ? "translate-x-1 text-foreground" : "",
        )}
      >
        {ctaLabel} <span aria-hidden>→</span>
      </Link>
    </motion.article>
  );
}
