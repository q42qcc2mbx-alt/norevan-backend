"use client";

import { useState } from "react";
import { PageTitle, Card, StatCard, Badge, formatPrice } from "./ui";
import { ALL_ORDERS, TICKETS, INVENTORY, type OrderStatus } from "../_lib/data";

// Operational back office. Functional, tidy, work-oriented. No financial or
// strategic data — those panels live only in the Owner view.

function Dashboard() {
  const open = ALL_ORDERS.filter((o) => o.status === "offen").length;
  const shipping = ALL_ORDERS.filter((o) => o.status === "versendet").length;
  const openTickets = TICKETS.filter((t) => t.status === "offen").length;
  const lowStock = INVENTORY.filter((i) => i.stock <= 3).length;
  return (
    <div>
      <PageTitle eyebrow="Tagesgeschäft" title="Operatives Dashboard" sub="Was heute zu tun ist." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Offene Bestellungen" value={String(open)} />
        <StatCard label="Zu versenden" value={String(shipping)} />
        <StatCard label="Offene Tickets" value={String(openTickets)} />
        <StatCard label="Niedriger Bestand" value={String(lowStock)} />
      </div>
      <div className="mt-8">
        <OrdersPanel compact />
      </div>
    </div>
  );
}

export function OrdersPanel({ compact = false }: { compact?: boolean }) {
  const [orders, setOrders] = useState(ALL_ORDERS);
  const next: Record<OrderStatus, OrderStatus | null> = {
    offen: "versendet",
    versendet: "geliefert",
    geliefert: null,
    storniert: null,
  };
  function advance(id: string) {
    setOrders((cur) =>
      cur.map((o) => (o.id === id && next[o.status] ? { ...o, status: next[o.status]! } : o)),
    );
  }
  const rows = compact ? orders.slice(0, 4) : orders;
  return (
    <Card className="p-0">
      <div className="border-b border-border-subtle px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Bestellungen{!compact && " bearbeiten"}
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="text-sm">
                {o.customer} <span className="font-mono text-[10px] text-muted">{o.id}</span>
              </div>
              <div className="font-mono text-[10px] text-muted">{o.date} · {o.items} Artikel</div>
            </div>
            <span className="hidden w-20 text-right tabular-nums sm:block">
              {formatPrice(o.totalCents, "de")}
            </span>
            <Badge status={o.status} />
            {next[o.status] && (
              <button
                onClick={() => advance(o.id)}
                className="rounded-full border border-border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                → {next[o.status]}
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SupportPanel() {
  return (
    <Card className="p-0">
      <div className="border-b border-border-subtle px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Kundensupport · Tickets
      </div>
      <div className="divide-y divide-border-subtle">
        {TICKETS.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="text-sm">{t.subject}</div>
              <div className="font-mono text-[10px] text-muted">{t.customer} · {t.id} · {t.last}</div>
            </div>
            <Badge status={t.status} />
            <button className="rounded-full border border-border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background">
              Antworten
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function InventoryPanel() {
  const [items, setItems] = useState(INVENTORY);
  function setStock(sku: string, delta: number) {
    setItems((cur) =>
      cur.map((i) => (i.sku === sku ? { ...i, stock: Math.max(0, i.stock + delta) } : i)),
    );
  }
  return (
    <Card className="p-0">
      <div className="border-b border-border-subtle px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Lagerbestand
      </div>
      <div className="divide-y divide-border-subtle">
        {items.map((i) => (
          <div key={i.sku} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="text-sm">{i.name}</div>
              <div className="font-mono text-[10px] text-muted">{i.sku}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStock(i.sku, -1)}
                className="h-7 w-7 rounded-full border border-border font-mono text-sm transition-colors hover:border-foreground"
              >
                −
              </button>
              <span
                className={`w-12 text-center font-mono text-sm tabular-nums ${
                  i.stock === 0 ? "text-red-400" : i.stock <= 3 ? "text-[var(--gold)]" : ""
                }`}
              >
                {i.stock}
              </span>
              <button
                onClick={() => setStock(i.sku, +1)}
                className="h-7 w-7 rounded-full border border-border font-mono text-sm transition-colors hover:border-foreground"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdminView({ active }: { active: string }) {
  switch (active) {
    case "orders":
      return (
        <div>
          <PageTitle eyebrow="Tagesgeschäft" title="Bestellungen bearbeiten" />
          <OrdersPanel />
        </div>
      );
    case "support":
      return (
        <div>
          <PageTitle eyebrow="Tagesgeschäft" title="Kundensupport" />
          <SupportPanel />
        </div>
      );
    case "inventory":
      return (
        <div>
          <PageTitle eyebrow="Tagesgeschäft" title="Lagerbestand" sub="Stückzahlen aktualisieren." />
          <InventoryPanel />
        </div>
      );
    default:
      return <Dashboard />;
  }
}
