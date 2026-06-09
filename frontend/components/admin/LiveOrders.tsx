"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type LiveOrder = {
  id: string;
  name: string;
  city: string;
  country: string;
  status: string;
  cents: number;
  createdAt: string;
  items: { name: string; qty: number }[];
};

const STATUS_CLS: Record<string, string> = {
  pending: "border-[var(--gold)] text-[var(--gold)]",
  paid: "border-emerald-500/50 text-emerald-500",
  shipped: "border-emerald-500/50 text-emerald-500",
  delivered: "border-emerald-500/50 text-emerald-500",
  cancelled: "border-red-400/50 text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "offen",
  paid: "bezahlt",
  shipped: "versendet",
  delivered: "geliefert",
  cancelled: "storniert",
  demo: "demo",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  return `vor ${d} Tag${d === 1 ? "" : "en"}`;
}

function itemsSummary(items: { name: string; qty: number }[]): string {
  if (items.length === 0) return "—";
  const first = items
    .slice(0, 2)
    .map((i) => `${i.qty}× ${i.name}`)
    .join(", ");
  const more = items.length - 2;
  return more > 0 ? `${first} +${more} weitere` : first;
}

export function LiveOrders() {
  const [orders, setOrders] = useState<LiveOrder[] | null>(null);
  const [error, setError] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/live-orders", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { orders: LiveOrder[] };
        if (!active) return;
        setOrders(data.orders);
        setError(false);
        setLive(true);
        setTimeout(() => active && setLive(false), 1200);
      } catch {
        if (active) setError(true);
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-emerald-500 ${live ? "animate-ping" : ""}`}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live · Bestellungen
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          aktualisiert alle 15&nbsp;s
        </span>
      </div>

      {error && orders === null ? (
        <p className="px-6 py-8 text-sm text-muted">
          Bestellungen konnten nicht geladen werden.
        </p>
      ) : orders === null ? (
        <p className="px-6 py-8 text-sm text-muted">Lädt…</p>
      ) : orders.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">Noch keine Bestellungen.</p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-4 transition-colors hover:bg-muted-bg"
                title="Rechnung & Details öffnen"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium underline-offset-4 group-hover:underline">
                      {o.name}
                    </span>
                    <span
                      className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${
                        STATUS_CLS[o.status] ?? "border-border text-muted"
                      }`}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted">
                    {itemsSummary(o.items)}
                    {o.city ? ` · ${o.city}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm tabular-nums">
                    {formatPrice(o.cents, "de")}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
                    {timeAgo(o.createdAt)}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
