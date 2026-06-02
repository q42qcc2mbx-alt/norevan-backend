import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { RevenueChart, type ChartPoint } from "@/components/admin/RevenueChart";

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
  const orders = await getAllOrders(500);
  const products = await getAllProducts();

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
        <Stat label="Heute" value={String(ordersToday.length)} sub={`${ordersToday.reduce((s, o) => s + o.subtotalCents, 0) === 0 ? "—" : formatPrice(ordersToday.reduce((s, o) => s + o.subtotalCents, 0), "de")}`} />
        <Stat label="Pending / Paid" value={String(pendingCount)} sub="zu versenden" />
      </div>

      {/* Revenue over time — coordinate system */}
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

      <div className="mt-10 grid gap-4 md:grid-cols-2">
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
