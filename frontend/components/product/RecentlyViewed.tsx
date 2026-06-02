"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed, type RvItem } from "@/lib/recently-viewed";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

export function RecentlyViewed({
  current,
  locale,
}: {
  current: RvItem;
  locale: Locale;
}) {
  const items = useRecentlyViewed((s) => s.items);
  const record = useRecentlyViewed((s) => s.record);
  const [mounted, setMounted] = useState(false);

  // Avoid SSR/client hydration mismatch — only render after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Recording a view is an intentional side effect.
  useEffect(() => record(current), [current, record]);

  if (!mounted) return null;
  const others = items.filter((i) => i.slug !== current.slug).slice(0, 5);
  if (others.length === 0) return null;

  return (
    <section className="mt-24 border-t border-border-subtle pt-16 md:mt-32 md:pt-20">
      <span className="eyebrow">
        {locale === "de" ? "Zuletzt angesehen" : "Recently viewed"}
      </span>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {others.map((p) => (
          <Link key={p.slug} href={`/${locale}/shop/${p.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted-bg">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-2 truncate text-xs font-medium text-foreground">
              {p.name}
            </div>
            <div className="font-mono text-[10px] tabular-nums text-muted">
              {formatPrice(p.priceCents, locale)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
