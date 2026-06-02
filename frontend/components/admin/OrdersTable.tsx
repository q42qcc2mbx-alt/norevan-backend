"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { updateOrderStatusAction } from "@/app/admin/_actions/orders";
import type { OrderWithItems } from "@/lib/orders";

const STATUSES = ["demo", "paid", "shipped", "cancelled"] as const;

export function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [orders, query, status]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suche: Name, E-Mail, Bestell-ID…"
          className="h-10 flex-1 min-w-[220px] rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 font-mono text-[10px] uppercase tracking-[0.2em]"
        >
          <option value="all">Alle Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {filtered.length} / {orders.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-background-soft text-left font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Kunde</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Datum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-b border-border-subtle last:border-0 hover:bg-muted-bg/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] hover:underline"
                  >
                    {o.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {o.firstName} {o.lastName}
                  </div>
                  <div className="text-xs text-muted">{o.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {o.items.length} ·{" "}
                  {o.items
                    .map((i) => `${i.qty}× ${i.name.split(" ").slice(0, 2).join(" ")}`)
                    .slice(0, 2)
                    .join(", ")}
                  {o.items.length > 2 ? "…" : ""}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPrice(o.subtotalCents, "de")}
                </td>
                <td className="px-4 py-3">
                  <form action={updateOrderStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select
                      name="status"
                      defaultValue={o.status}
                      className="rounded-sm border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="font-mono text-[9px] uppercase tracking-[0.2em] underline-offset-4 hover:underline"
                      title="Status speichern"
                    >
                      ✓
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {new Date(o.createdAt).toLocaleString("de-DE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  Keine Treffer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
