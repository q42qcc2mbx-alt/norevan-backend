"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/cn";

export function WishlistView({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { items, remove } = useWishlist();
  const { add: addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="mb-6 text-muted"
          aria-hidden
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          {locale === "de" ? "Deine Wunschliste ist leer." : "Your wishlist is empty."}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground underline-offset-4 hover:underline"
        >
          {locale === "de" ? "Weiter shoppen" : "Continue shopping"}
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.slug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="group relative flex flex-col"
        >
          <div className="relative">
            <Link
              href={`/${locale}/shop/${item.slug}`}
              className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-muted-bg"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </Link>
            <button
              type="button"
              onClick={() => remove(item.slug)}
              aria-label={locale === "de" ? "Entfernen" : "Remove"}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-foreground bg-foreground text-background backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              {item.brand.replace(/-/g, " ")}
            </span>
            <Link
              href={`/${locale}/shop/${item.slug}`}
              className="mt-1 block truncate text-sm font-medium text-foreground hover:underline"
            >
              {item.name}
            </Link>
            <span className="mt-0.5 block text-sm tabular-nums text-foreground">
              {formatPrice(item.priceCents, locale)}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              addToCart({
                slug: item.slug,
                name: item.name,
                priceCents: item.priceCents,
                image: item.image,
              })
            }
            className={cn(
              "mt-3 w-full border border-border py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
            )}
          >
            {dict.shop.addToCart}
          </button>
        </motion.div>
      ))}
    </div>
  );
}
