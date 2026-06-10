"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useWishlist } from "@/lib/wishlist-store";
import { Stars } from "./Stars";

const LOW_STOCK = 5;

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
  const { toggle, has } = useWishlist();
  const wishlisted = has(product.slug);
  const primary = product.images[0];
  const secondary = product.images[1] ?? primary;

  return (
    <motion.article
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("group relative flex flex-col", className)}
    >
      <div className="relative">
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
      {product.stock === 0 ? (
        <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
          {locale === "de" ? "Ausverkauft" : "Sold out"}
        </span>
      ) : (
        typeof product.stock === "number" &&
        product.stock <= LOW_STOCK && (
          <span
            className="absolute left-2 top-2 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#0c0a14] backdrop-blur-sm"
            style={{ background: "var(--gold)" }}
          >
            {locale === "de" ? `Nur noch ${product.stock}` : `Only ${product.stock} left`}
          </span>
        )
      )}
      <motion.button
        type="button"
        onClick={() =>
          toggle({
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            image: product.images[0].src,
            brand: product.brand,
          })
        }
        whileTap={{ scale: 0.9 }}
        aria-label={wishlisted ? (locale === "de" ? "Von Wunschliste entfernen" : "Remove from wishlist") : (locale === "de" ? "Zur Wunschliste" : "Add to wishlist")}
        aria-pressed={wishlisted}
        className={cn(
          "absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-sm transition-colors",
          wishlisted
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background/70 text-foreground hover:border-foreground",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.button>
      </div>

      <div className="flex items-start justify-between gap-2 pt-2 md:gap-3 md:pt-4">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted md:text-[10px] md:tracking-[0.25em]">
            {product.brand.replace(/-/g, " ")}
          </span>
          <Link
            href={`/${locale}/shop/${product.slug}`}
            className="mt-0.5 block truncate text-xs font-medium text-foreground hover:underline md:mt-1 md:text-sm"
          >
            {product.name}
          </Link>
          {typeof product.ratingCount === "number" && product.ratingCount > 0 && (
            <span className="mt-1 flex items-center gap-1.5">
              <Stars value={product.rating ?? 0} size={11} />
              <span className="font-mono text-[10px] text-muted">({product.ratingCount})</span>
            </span>
          )}
        </div>
        <span className="whitespace-nowrap pt-3 text-xs tabular-nums text-foreground md:pt-4 md:text-sm">
          {formatPrice(product.priceCents, locale)}
        </span>
      </div>

      <Link
        href={`/${locale}/shop/${product.slug}`}
        className={cn(
          "mt-1 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-all duration-300 md:inline-flex",
          hover ? "translate-x-1 text-foreground" : "",
        )}
      >
        {ctaLabel} <span aria-hidden>→</span>
      </Link>
    </motion.article>
  );
}
