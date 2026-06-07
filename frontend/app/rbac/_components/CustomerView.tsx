"use client";

import { PageTitle, Card, Badge, formatPrice } from "./ui";
import { PRODUCTS, CATEGORIES, MY_ORDERS } from "../_lib/data";

// Customer-facing storefront. Inviting, visual, shopping-focused. Sees nothing
// of the internal databases.

function ProductCard({ p }: { p: (typeof PRODUCTS)[number] }) {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-square overflow-hidden bg-muted-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          {p.category}
        </div>
        <div className="mt-1 truncate text-sm">{p.name}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="tabular-nums">{formatPrice(p.priceCents, "de")}</span>
          <span className="font-mono text-[10px] text-[var(--gold)]">★ {p.rating}</span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-foreground p-10 text-background md:p-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] opacity-60">
          Neue Kollektion · 2026
        </div>
        <h1
          className="mt-4 max-w-xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.02 }}
        >
          Premium Streetwear, kuratiert in Berlin.
        </h1>
        <button className="mt-8 rounded-full bg-background px-7 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground transition-opacity hover:opacity-90">
          Jetzt entdecken
        </button>
      </div>

      {/* Categories */}
      <section>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          Kategorien
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="group overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-square overflow-hidden bg-muted-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-3 text-center font-mono text-[9px] uppercase tracking-[0.2em]">
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          Bestseller
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Shop() {
  return (
    <div>
      <PageTitle eyebrow="Shop" title="Alle Produkte" sub="Handverlesene Auswahl." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}

function Cart() {
  const lines = PRODUCTS.slice(0, 3);
  const total = lines.reduce((s, p) => s + p.priceCents, 0);
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle eyebrow="Warenkorb" title="Dein Warenkorb" />
      <Card className="divide-y divide-border-subtle p-0">
        {lines.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 overflow-hidden rounded-md bg-muted-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{p.name}</div>
              <div className="font-mono text-[10px] text-muted">Menge: 1</div>
            </div>
            <div className="tabular-nums">{formatPrice(p.priceCents, "de")}</div>
          </div>
        ))}
      </Card>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Gesamt</span>
        <span className="tabular-nums" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem" }}>
          {formatPrice(total, "de")}
        </span>
      </div>
      <button className="mt-4 w-full rounded-full bg-foreground py-3.5 font-mono text-[10px] uppercase tracking-[0.25em] text-background">
        Zur Kasse
      </button>
    </div>
  );
}

function Profile() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle eyebrow="Mein Profil" title="Bestellhistorie" sub="Deine letzten Bestellungen." />
      <Card className="divide-y divide-border-subtle p-0">
        {MY_ORDERS.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-sm">{o.id}</div>
              <div className="font-mono text-[10px] text-muted">{o.date} · {o.items} Artikel</div>
            </div>
            <Badge status={o.status} />
            <div className="w-24 text-right tabular-nums">{formatPrice(o.totalCents, "de")}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export function CustomerView({ active }: { active: string }) {
  switch (active) {
    case "shop":
      return <Shop />;
    case "cart":
      return <Cart />;
    case "profile":
      return <Profile />;
    default:
      return <Home />;
  }
}
