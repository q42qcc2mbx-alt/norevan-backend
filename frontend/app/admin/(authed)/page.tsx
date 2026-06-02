import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { RevenueChart, type ChartPoint } from "@/components/admin/RevenueChart";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { updateOrderStatusAction } from "@/app/admin/_actions/orders";

const REALIZED = new Set(["paid", "shipped", "delivered"]);

/** Daily realized revenue for the last `days` days (oldest → newest). */
function dailyRevenueSeries(
  orders: { status: string; subtotalCents: number; createdAt: string }[],
  days = 30,
): ChartPoint[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const o of orders) {
    if (!REALIZED.has(o.status)) continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + o.subtotalCents);
  }

  return Array.from(buckets.entries()).map(([iso, valueCents]) => {
    const [, m, d] = iso.split("-");
    return { label: `${Number(d)}.${Number(m)}`, valueCents };
  });
}

export const metadata = {
  title: "Dashboard — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const [orders, products, user] = await Promise.all([
    getAllOrders(500),
    getAllProducts(),
    getAdminUser(),
  ]);
  const role = user ? effectiveRole(user) : "staff";
  const showRevenue = canSeeRevenue(role);

  const totalRevenueCents = orders
    .filter((o) => o.status === "paid" || o.status === "shipped")
    .reduce((s, o) => s + o.subtotalCents, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = orders.filter(
    (o) => new Date(o.createdAt).getTime() >= today.getTime(),
  );

  const pendingCount = orders.filter(
    (o) => o.status === "demo" || o.status === "paid",
  ).length;

  const revenueSeries = dailyRevenueSeries(orders, 30);
  const last30Cents = revenueSeries.reduce((s, p) => s + p.valueCents, 0);

  // Paid orders awaiting shipment — the core fulfilment queue.
  const toShip = orders.filter((o) => o.status === "paid").slice(0, 8);

  // Low / out-of-stock items (operational — shown to all back-office roles).
  const lowStock = products
    .filter((p) => typeof p.stock === "number" && (p.stock as number) <= 5)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Übersicht
        </span>
        <h1
          className="mt-2 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
            lineHeight: 1,
          }}
        >
          Dashboard
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produkte" value={String(products.length)} href="/admin/products" />
        <Stat label="Bestellungen" value={String(orders.length)} href="/admin/orders" />
        <Stat
          label="Heute"
          value={String(ordersToday.length)}
          sub={
            showRevenue
              ? ordersToday.reduce((s, o) => s + o.subtotalCents, 0) === 0
                ? "—"
                : formatPrice(
                    ordersToday.reduce((s, o) => s + o.subtotalCents, 0),
                    "de",
                  )
              : "Bestellungen"
          }
        />
        <Stat label="Pending / Paid" value={String(pendingCount)} sub="zu versenden" />
      </div>

      {/* Fulfilment queue — paid orders awaiting shipment */}
      {toShip.length > 0 && (
        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Zu versenden · {toShip.length}
            </div>
            <Link
              href="/admin/orders"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-foreground"
            >
              Alle Bestellungen →
            </Link>
          </div>
          <ul className="divide-y divide-border-subtle">
            {toShip.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">
                    {o.firstName} {o.lastName}
                    <span className="ml-2 font-mono text-[10px] text-muted">
                      #{o.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted">
                    {o.items.reduce((s, i) => s + i.qty, 0)} Artikel ·{" "}
                    {[o.zip, o.city].filter(Boolean).join(" ")} {o.country}
                  </div>
                </div>
                <form action={updateOrderStatusAction}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="status" value="shipped" />
                  <button
                    type="submit"
                    className="rounded-full border border-border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    Als versandt markieren
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Low / out-of-stock alert */}
      {lowStock.length > 0 && (
        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Niedriger Bestand
            </div>
            <Link
              href="/admin/products"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-foreground"
            >
              Alle Produkte →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {lowStock.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="truncate underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
                <span
                  className={`whitespace-nowrap font-mono text-[11px] tabular-nums ${
                    p.stock === 0 ? "text-red-400" : "text-[var(--gold)]"
                  }`}
                >
                  {p.stock === 0 ? "Ausverkauft" : `${p.stock} übrig`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Revenue over time — coordinate system (admins & owners only) */}
      {showRevenue && (
        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Umsatz · letzte 30 Tage
            </div>
            <div
              className="font-serif tabular-nums"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              {formatPrice(last30Cents, "de")}
            </div>
          </div>
          <RevenueChart data={revenueSeries} />
        </div>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {showRevenue && (
          <div className="rounded-md border border-border bg-card p-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Realisierter Umsatz
            </div>
            <div
              className="font-serif"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1,
              }}
            >
              {formatPrice(totalRevenueCents, "de")}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              aus paid + shipped
            </div>
          </div>
        )}
        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Letzte Bestellungen
          </div>
          <ul className="space-y-3 text-sm">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/orders`}
                  className="truncate hover:underline underline-offset-4"
                >
                  {o.firstName} {o.lastName}
                </Link>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {o.status}
                </span>
                <span className="tabular-nums">{formatPrice(o.subtotalCents, "de")}</span>
              </li>
            ))}
            {orders.length === 0 && (
              <li className="text-muted">Noch keine Bestellungen.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const Inner = (
    <div className="rounded-md border border-border bg-card p-5 transition-colors hover:border-foreground/40">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div
        className="mt-3 font-serif"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {sub}
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{Inner}</Link> : Inner;
}
