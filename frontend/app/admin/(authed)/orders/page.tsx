import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { updateOrderStatusAction } from "@/app/admin/_actions/orders";

export const metadata = {
  title: "Admin · Orders — Norevan",
  robots: { index: false, follow: false },
};

const STATUSES = ["demo", "paid", "shipped", "cancelled"] as const;

export default async function AdminOrdersPage() {
  const orders = await getAllOrders(200);

  const totalRevenueCents = orders.reduce((s, o) => s + o.subtotalCents, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            Norevan · Admin
          </span>
          <h1
            className="mt-2 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              lineHeight: 1,
            }}
          >
            Bestellungen
          </h1>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          <div>{orders.length} {orders.length === 1 ? "Order" : "Orders"}</div>
          <div className="mt-1 text-foreground">
            {formatPrice(totalRevenueCents, "de")}
          </div>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-md border border-border-subtle bg-card p-12 text-center">
          <p className="text-muted">
            Noch keine Bestellungen.{" "}
            <Link href="/de/checkout" className="underline underline-offset-4 hover:text-foreground">
              Demo-Checkout durchspielen
            </Link>
          </p>
        </div>
      ) : (
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
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-muted-bg/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/de/checkout/success?orderId=${o.id}`}
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
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        SQLite · noindex
      </p>
    </div>
  );
}
