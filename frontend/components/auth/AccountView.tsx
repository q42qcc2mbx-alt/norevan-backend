"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/i18n/config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

type OrderItem = { name: string; size: string | null; qty: number };

type Address = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
};
const EMPTY_ADDRESS: Address = {
  first_name: "",
  last_name: "",
  address: "",
  city: "",
  zip: "",
  country: "",
  phone: "",
};

type Order = {
  id: string;
  status: string;
  subtotalCents: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, { de: string; en: string }> = {
  pending: { de: "In Bearbeitung", en: "Processing" },
  paid: { de: "Bezahlt", en: "Paid" },
  shipped: { de: "Versandt", en: "Shipped" },
  cancelled: { de: "Storniert", en: "Cancelled" },
  demo: { de: "Demo", en: "Demo" },
};

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-border-subtle px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div className="mt-1 text-lg font-medium tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function AddrField({
  label,
  value,
  onChange,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel";
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="h-11 w-full border-0 border-b border-border bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

export function AccountView({ locale }: { locale: Locale }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addr, setAddr] = useState<Address>(EMPTY_ADDRESS);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrSaved, setAddrSaved] = useState(false);
  const supabase = getSupabaseClient();
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();
  const isDe = locale === "de";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
      if (data.user) {
        setOrdersLoading(true);
        fetch("/api/orders/me")
          .then((r) => r.json())
          .then((d) => setOrders(Array.isArray(d.orders) ? d.orders : []))
          .catch(() => setOrders([]))
          .finally(() => setOrdersLoading(false));

        supabase
          .from("profiles")
          .select("first_name,last_name,address,city,zip,country,phone")
          .eq("id", data.user.id)
          .single()
          .then(({ data: p }) => {
            if (p) {
              setAddr({
                first_name: p.first_name ?? "",
                last_name: p.last_name ?? "",
                address: p.address ?? "",
                city: p.city ?? "",
                zip: p.zip ?? "",
                country: p.country ?? "",
                phone: p.phone ?? "",
              });
            }
          });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const setField = (k: keyof Address, v: string) => {
    setAddr((a) => ({ ...a, [k]: v }));
    setAddrSaved(false);
  };

  const handleSaveAddress = async () => {
    if (!user || addrSaving) return;
    setAddrSaving(true);
    setAddrSaved(false);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(addr)
        .eq("id", user.id);
      if (!error) {
        setAddrSaved(true);
        setTimeout(() => setAddrSaved(false), 2500);
      }
    } finally {
      setAddrSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-sm bg-muted-bg" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <p className="text-base text-muted">
          {isDe
            ? "Melde dich an, um dein Konto zu verwalten."
            : "Sign in to manage your account."}
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-8 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-80"
        >
          {isDe ? "Anmelden" : "Sign in"}
          <span aria-hidden>→</span>
        </Link>
        <div className="mt-10 border-t border-border-subtle pt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatBox
              label={isDe ? "Wunschliste" : "Wishlist"}
              value={wishlistItems.length}
            />
            <StatBox
              label={isDe ? "Im Warenkorb" : "In cart"}
              value={cartItems.reduce((s, i) => s + i.qty, 0)}
            />
          </div>
        </div>
      </div>
    );
  }

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString(
        isDe ? "de-DE" : "en-GB",
        { day: "2-digit", month: "long", year: "numeric" },
      )
    : "–";

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <div className="border border-border-subtle p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              {isDe ? "Angemeldet als" : "Signed in as"}
            </div>
            <div className="mt-1 text-base font-medium text-foreground">
              {user.email}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {isDe ? "Abmelden" : "Sign out"}
          </button>
        </div>
      </div>

      {/* Shipping address */}
      <div className="border border-border-subtle p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {isDe ? "Lieferadresse" : "Shipping address"}
          </span>
          {addrSaved && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
              {isDe ? "Gespeichert ✓" : "Saved ✓"}
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AddrField label={isDe ? "Vorname" : "First name"} value={addr.first_name} onChange={(v) => setField("first_name", v)} autoComplete="given-name" />
          <AddrField label={isDe ? "Nachname" : "Last name"} value={addr.last_name} onChange={(v) => setField("last_name", v)} autoComplete="family-name" />
          <div className="sm:col-span-2">
            <AddrField label={isDe ? "Straße & Hausnummer" : "Street & number"} value={addr.address} onChange={(v) => setField("address", v)} autoComplete="street-address" />
          </div>
          <AddrField label={isDe ? "PLZ" : "ZIP"} value={addr.zip} onChange={(v) => setField("zip", v)} autoComplete="postal-code" inputMode="numeric" />
          <AddrField label={isDe ? "Stadt" : "City"} value={addr.city} onChange={(v) => setField("city", v)} autoComplete="address-level2" />
          <AddrField label={isDe ? "Land" : "Country"} value={addr.country} onChange={(v) => setField("country", v)} autoComplete="country-name" />
          <AddrField label={isDe ? "Telefon (optional)" : "Phone (optional)"} value={addr.phone} onChange={(v) => setField("phone", v)} autoComplete="tel" inputMode="tel" />
        </div>

        <button
          type="button"
          onClick={handleSaveAddress}
          disabled={addrSaving}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-7 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {addrSaving ? (isDe ? "Wird gespeichert…" : "Saving…") : (isDe ? "Adresse speichern" : "Save address")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatBox
          label={isDe ? "Mitglied seit" : "Member since"}
          value={joined}
        />
        <StatBox
          label={isDe ? "Wunschliste" : "Wishlist"}
          value={wishlistItems.length}
        />
        <StatBox
          label={isDe ? "Im Warenkorb" : "In cart"}
          value={cartItems.reduce((s, i) => s + i.qty, 0)}
        />
      </div>

      {/* Order history */}
      <div className="border-t border-border-subtle pt-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {isDe ? "Bestellungen" : "Orders"}
        </span>
        {ordersLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-sm bg-muted-bg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            {isDe
              ? "Noch keine Bestellungen. Deine Einkäufe erscheinen hier."
              : "No orders yet. Your purchases will appear here."}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {orders.map((o) => {
              const date = o.createdAt
                ? new Date(o.createdAt).toLocaleDateString(
                    isDe ? "de-DE" : "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" },
                  )
                : "";
              const status = STATUS_LABEL[o.status] ?? { de: o.status, en: o.status };
              const count = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <li key={o.id} className="border border-border-subtle px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      #{o.id.slice(0, 8)}
                    </span>
                    <span className="rounded-full border border-border-subtle px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground">
                      {isDe ? status.de : status.en}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-foreground">
                        {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted">
                        {date} · {count} {isDe ? "Artikel" : "items"}
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                      {formatPrice(o.subtotalCents, locale)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="border-t border-border-subtle pt-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {isDe ? "Schnellzugriff" : "Quick access"}
        </span>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              label: isDe ? "Wunschliste anzeigen" : "View wishlist",
              href: `/${locale}/wishlist`,
              count: wishlistItems.length,
            },
            {
              label: isDe ? "Warenkorb anzeigen" : "View cart",
              href: `/${locale}/cart`,
              count: cartItems.reduce((s, i) => s + i.qty, 0),
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between border border-border-subtle px-5 py-4 transition-colors hover:border-foreground"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                {link.label}
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] text-muted group-hover:text-foreground">
                {link.count > 0 && (
                  <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[9px] text-background">
                    {link.count}
                  </span>
                )}
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
