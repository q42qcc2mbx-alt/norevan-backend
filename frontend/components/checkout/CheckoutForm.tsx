"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useCart, cartSubtotalCents } from "@/lib/cart-store";
import { AddressAutocomplete, type AddressPick } from "./AddressAutocomplete";
import { UseMyLocationButton } from "@/components/address/UseMyLocationButton";
import { formatPrice } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase/client";
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
  const [codeInput, setCodeInput] = useState("");
  const [discount, setDiscount] = useState<{ code: string; cents: number } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [codeBusy, setCodeBusy] = useState(false);
  // Buying requires a real (non-guest) account. Browsing stays open.
  const [authState, setAuthState] = useState<"checking" | "ok" | "denied">(
    "checking",
  );
  const subtotal = cartSubtotalCents(items);
  const discountCents = discount ? Math.min(discount.cents, subtotal) : 0;
  const total = subtotal - discountCents;
  const isDe = locale === "de";

  async function applyCode() {
    const code = codeInput.trim();
    if (!code || codeBusy) return;
    setCodeBusy(true);
    setCodeMsg(null);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotalCents: subtotal }),
      });
      const d = (await res.json()) as { valid: boolean; code?: string; discountCents?: number; message?: string };
      if (d.valid && d.discountCents) {
        setDiscount({ code: d.code ?? code.toUpperCase(), cents: d.discountCents });
        setCodeMsg(null);
      } else {
        setDiscount(null);
        setCodeMsg(d.message ?? (isDe ? "Code ungültig" : "Invalid code"));
      }
    } catch {
      setCodeMsg(isDe ? "Fehler — bitte erneut" : "Error — try again");
    } finally {
      setCodeBusy(false);
    }
  }

  const loginHref = `/${locale}/login?next=${encodeURIComponent(
    `/${locale}/checkout`,
  )}`;

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      // Anonymous guests can browse but not buy — only real accounts may check out.
      if (!u || u.is_anonymous) {
        setAuthState("denied");
        router.replace(loginHref);
        return;
      }
      setAuthState("ok");

      // Prefill from the saved profile address. Only fills empty fields so we
      // never clobber anything the customer has already typed.
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name,last_name,address,city,zip,country")
        .eq("id", u.id)
        .single();

      setForm((s) => ({
        ...s,
        email: s.email || u.email || "",
        firstName: s.firstName || p?.first_name || "",
        lastName: s.lastName || p?.last_name || "",
        address: s.address || p?.address || "",
        city: s.city || p?.city || "",
        zip: s.zip || p?.zip || "",
        country: s.country || p?.country || "",
      }));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  // Persist the entered shipping address back to the customer's profile so the
  // next checkout is pre-filled (one-click). Best-effort; never blocks the order.
  async function persistProfile() {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u || u.is_anonymous) return;
      await supabase
        .from("profiles")
        .update({
          first_name: form.firstName || null,
          last_name: form.lastName || null,
          address: form.address || null,
          city: form.city || null,
          zip: form.zip || null,
          country: form.country || null,
        })
        .eq("id", u.id);
    } catch {
      // best-effort — a failed save just means no prefill next time
    }
  }

  // Fill the whole address from a picked suggestion without wiping fields the
  // suggestion doesn't cover (e.g. a city-only pick keeps the typed street).
  function fillAddress(a: AddressPick) {
    setForm((s) => ({
      ...s,
      address: a.street || s.address,
      zip: a.zip || s.zip,
      city: a.city || s.city,
      country: a.country || s.country,
    }));
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
        body: JSON.stringify({ ...form, items, discountCode: discount?.code }),
      });
      if (res.status === 401) {
        // Session expired or guest — send them to log in, then back here.
        router.replace(loginHref);
        return;
      }
      const data = await res.json();
      // Save the address for next time. Must complete BEFORE we navigate to
      // Stripe (window.location) — otherwise the redirect aborts the in-flight
      // request and nothing is saved.
      if (res.ok) await persistProfile();
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

  if (authState === "checking") {
    return (
      <div className="grid place-items-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="grid place-items-center gap-5 py-24 text-center">
        <p className="text-muted">
          {locale === "de"
            ? "Zum Kaufen bitte anmelden oder ein Konto erstellen."
            : "Please sign in or create an account to buy."}
        </p>
        <button
          type="button"
          onClick={() => router.push(loginHref)}
          className="inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-8 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-80"
        >
          {locale === "de" ? "Anmelden" : "Sign in"}
          <span aria-hidden>→</span>
        </button>
      </div>
    );
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <legend className="text-sm font-medium uppercase tracking-wide text-muted">
              {dict.checkout.shipping}
            </legend>
            <UseMyLocationButton
              locale={locale === "de" ? "de" : "en"}
              onPick={fillAddress}
            />
          </div>
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
              <AddressAutocomplete
                value={form.address}
                inputCls={inputCls}
                onChange={(v) => update("address", v)}
                onPick={fillAddress}
              />
            </div>
            <div>
              <label className={labelCls}>{dict.checkout.zip}</label>
              <AddressAutocomplete
                value={form.zip}
                inputCls={inputCls}
                onChange={(v) => update("zip", v)}
                onPick={fillAddress}
              />
            </div>
            <div>
              <label className={labelCls}>{dict.checkout.city}</label>
              <AddressAutocomplete
                value={form.city}
                inputCls={inputCls}
                onChange={(v) => update("city", v)}
                onPick={fillAddress}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict.checkout.country}</label>
              <AddressAutocomplete
                value={form.country}
                inputCls={inputCls}
                onChange={(v) => update("country", v)}
                onPick={fillAddress}
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
        {/* Discount code */}
        <div className="mb-4 border-t border-border pt-4">
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCode())}
              placeholder={isDe ? "Rabattcode" : "Discount code"}
              className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-xs uppercase tracking-[0.15em] focus:border-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={applyCode}
              disabled={codeBusy || !codeInput.trim()}
              className="h-10 rounded-lg border border-border px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground disabled:opacity-40"
            >
              {codeBusy ? "…" : isDe ? "Einlösen" : "Apply"}
            </button>
          </div>
          {codeMsg && <p className="mt-2 font-mono text-[10px] text-red-400">{codeMsg}</p>}
          {discount && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
              {discount.code} {isDe ? "angewendet" : "applied"}
            </p>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">{dict.cart.subtotal}</span>
            <span className="font-medium">
              {formatPrice(subtotal, locale)}
            </span>
          </div>
          {discountCents > 0 && (
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted">{isDe ? "Rabatt" : "Discount"}</span>
              <span className="font-medium text-[var(--gold)]">
                −{formatPrice(discountCents, locale)}
              </span>
            </div>
          )}
          <div className="mb-4 flex justify-between text-sm">
            <span className="text-muted">{dict.cart.shipping}</span>
            <span>{dict.cart.shippingFree}</span>
          </div>
          <div className="mb-6 flex justify-between border-t border-border pt-4 text-base">
            <span className="font-semibold">{dict.cart.total}</span>
            <span className="font-semibold">
              {formatPrice(total, locale)}
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
