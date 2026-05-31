"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { useCart, cartSubtotalCents } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
};

const initial: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  zip: "",
  country: "",
};

export function CheckoutForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const subtotal = cartSubtotalCents(items);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-norevan-locale": locale,
        },
        body: JSON.stringify({ ...form, items }),
      });
      const data = await res.json();
      if (res.ok && data?.checkoutUrl) {
        // Stripe enabled — hand off to the hosted payment page. The cart is
        // kept so a cancelled payment returns the customer to a full basket;
        // it's cleared on the success page after payment.
        window.location.href = data.checkoutUrl;
      } else if (res.ok && data?.orderId) {
        // No-payment / dev mode — order is confirmed immediately.
        clear();
        router.push(
          `/${locale}/checkout/success?orderId=${encodeURIComponent(
            data.orderId,
          )}`,
        );
      } else {
        setSubmitting(false);
      }
    } catch {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="text-muted">{dict.cart.empty}</p>
      </div>
    );
  }

  const inputCls =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none";
  const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-muted";

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-10 lg:grid-cols-[1fr_380px]"
    >
      <div className="flex flex-col gap-8">
        <fieldset>
          <legend className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
            {dict.checkout.contact}
          </legend>
          <label className={labelCls}>{dict.checkout.email}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
            {dict.checkout.shipping}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{dict.checkout.firstName}</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={inputCls}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className={labelCls}>{dict.checkout.lastName}</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={inputCls}
                autoComplete="family-name"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict.checkout.address}</label>
              <input
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputCls}
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className={labelCls}>{dict.checkout.zip}</label>
              <input
                required
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
                className={inputCls}
                autoComplete="postal-code"
              />
            </div>
            <div>
              <label className={labelCls}>{dict.checkout.city}</label>
              <input
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputCls}
                autoComplete="address-level2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict.checkout.country}</label>
              <input
                required
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className={inputCls}
                autoComplete="country-name"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
            {dict.checkout.payment}
          </legend>
          <div className="rounded-lg border border-dashed border-border bg-muted-bg/40 p-4 text-sm text-muted">
            {dict.checkout.paymentNote}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-semibold">{dict.cart.title}</h2>
        <ul className="mb-5 flex flex-col gap-3 text-sm">
          {items.map((item) => (
            <li
              key={`${item.slug}-${item.size ?? ""}`}
              className="flex justify-between gap-3"
            >
              <span className="truncate">
                {item.qty}× {item.name}
                {item.size && (
                  <span className="text-muted"> · {item.size}</span>
                )}
              </span>
              <span className="whitespace-nowrap">
                {formatPrice(item.priceCents * item.qty, locale)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">{dict.cart.subtotal}</span>
            <span className="font-medium">
              {formatPrice(subtotal, locale)}
            </span>
          </div>
          <div className="mb-4 flex justify-between text-sm">
            <span className="text-muted">{dict.cart.shipping}</span>
            <span>{dict.cart.shippingFree}</span>
          </div>
          <div className="mb-6 flex justify-between border-t border-border pt-4 text-base">
            <span className="font-semibold">{dict.cart.total}</span>
            <span className="font-semibold">
              {formatPrice(subtotal, locale)}
            </span>
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={submitting}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-accent py-3 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? dict.checkout.processing : dict.checkout.submit}
        </motion.button>
      </aside>
    </form>
  );
}
