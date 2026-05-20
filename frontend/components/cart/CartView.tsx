"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  useCart,
  cartSubtotalCents,
  cartCount,
} from "@/lib/cart-store";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { formatPrice } from "@/lib/format";

export function CartView({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const count = cartCount(items);
  const subtotal = cartSubtotalCents(items);

  if (count === 0) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="mb-6 text-muted">{dict.cart.empty}</p>
        <Link
          href={`/${locale}/shop`}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground"
        >
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="flex flex-col">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={`${item.slug}-${item.size ?? ""}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex gap-5 border-b border-border py-5 first:pt-0 last:border-0"
            >
              <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted-bg">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/${locale}/shop/${item.slug}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                {item.size && (
                  <span className="mt-1 text-sm text-muted">
                    {dict.cart.size}: {item.size}
                  </span>
                )}
                <span className="mt-2 text-sm font-medium">
                  {formatPrice(item.priceCents, locale)}
                </span>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => setQty(item.slug, item.qty - 1, item.size)}
                      className="px-4 py-1.5 text-sm hover:bg-muted-bg"
                    >
                      −
                    </button>
                    <span className="min-w-8 px-2 text-center text-sm">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(item.slug, item.qty + 1, item.size)}
                      className="px-4 py-1.5 text-sm hover:bg-muted-bg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.slug, item.size)}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    {dict.cart.remove}
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-semibold">{dict.cart.title}</h2>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">{dict.cart.subtotal}</span>
          <span className="font-medium">
            {formatPrice(subtotal, locale)}
          </span>
        </div>
        <div className="mb-5 flex justify-between text-sm">
          <span className="text-muted">{dict.cart.shipping}</span>
          <span>{dict.cart.shippingFree}</span>
        </div>
        <div className="mb-6 flex justify-between border-t border-border pt-4 text-base">
          <span className="font-semibold">{dict.cart.total}</span>
          <span className="font-semibold">
            {formatPrice(subtotal, locale)}
          </span>
        </div>
        <Link
          href={`/${locale}/checkout`}
          className="block w-full rounded-full bg-accent py-3 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {dict.cart.checkout}
        </Link>
      </aside>
    </div>
  );
}
