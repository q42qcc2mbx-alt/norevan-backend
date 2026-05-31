import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "Bestellung bestätigt — Norevan",
};

async function SuccessContent({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <ClearCartOnMount />
      <Reveal>
        <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </Reveal>
      <Reveal delay={0.1}>
        <h1
          className="font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)",
            lineHeight: 1,
          }}
        >
          {dict.success.title}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-4 text-lg text-muted">{dict.success.body}</p>
      </Reveal>

      <Suspense fallback={null}>
        <OrderSummary searchParams={searchParams} locale={lang} />
      </Suspense>

      <Reveal delay={0.4}>
        <Link
          href={`/${lang}`}
          className="mt-10 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground"
        >
          {dict.success.home}
        </Link>
      </Reveal>
    </>
  );
}

export default function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <Suspense fallback={<div className="animate-pulse h-64 rounded-2xl bg-muted-bg" />}>
        <SuccessContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderSummary({
  searchParams,
  locale,
}: {
  searchParams: Promise<{ orderId?: string }>;
  locale: Locale;
}) {
  const { orderId } = await searchParams;
  if (!orderId) return null;

  const order = await getOrderById(orderId);
  if (!order) {
    return (
      <div className="mx-auto mt-6 inline-flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {locale === "de" ? "Bestellnummer" : "Order ID"}
        </span>
        <span className="font-mono text-sm">{orderId}</span>
      </div>
    );
  }

  const isDe = locale === "de";

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-lg border border-border bg-card p-6 text-left">
      <div className="mb-5 flex items-baseline justify-between border-b border-border-subtle pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {isDe ? "Bestellnummer" : "Order ID"}
          </span>
          <div className="mt-1 font-mono text-sm">{order.id}</div>
        </div>
        <span className="rounded-full bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground">
          {order.status}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-muted-bg">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                {item.qty}× {item.size ? `· ${item.size}` : ""}
              </span>
            </div>
            <span className="text-sm tabular-nums">
              {formatPrice(item.priceCents * item.qty, locale)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-baseline justify-between border-t border-border-subtle pt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        <span>{isDe ? "Gesamt" : "Total"}</span>
        <span
          className="font-serif text-xl normal-case tracking-normal text-foreground"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {formatPrice(order.subtotalCents, locale)}
        </span>
      </div>

      <div className="mt-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {isDe ? "Versand an" : "Shipping to"}
        <div className="mt-1 normal-case tracking-normal text-foreground">
          {order.firstName} {order.lastName}<br />
          {order.address}<br />
          {order.zip} {order.city}<br />
          {order.country}
        </div>
      </div>
    </div>
  );
}
