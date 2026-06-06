import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { RevenueChart, type ChartPoint } from "@/components/admin/RevenueChart";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { updateOrderStatusAction } from "@/app/admin/_actions/orders";

const REALIZED = new Set(["paid", "shipped", "delivered"]);

// German date parts — kept explicit so the label is always German regardless
// of the server's locale.
const WEEKDAYS = [
  "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag",
];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

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

/** Sum of realized revenue for orders created within [sinceMs, untilMs). */
function realizedRevenueBetween(
  orders: { status: string; subtotalCents: number; createdAt: string }[],
  sinceMs: number,
  untilMs = Infinity,
): number {
  let sum = 0;
  for (const o of orders) {
    if (!REALIZED.has(o.status)) continue;
    const t = new Date(o.createdAt).getTime();
    if (t >= sinceMs && t < untilMs) sum += o.subtotalCents;
  }
  return sum;
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
  const firstName = user?.username ? user.username.split(/[\s.@]/)[0] : null;

  const nowDate = new Date();
  const dateLabel = `${WEEKDAYS[nowDate.getDay()]}, ${nowDate.getDate()}. ${MONTHS[nowDate.getMonth()]} ${nowDate.getFullYear()}`;

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

  // Realized-revenue breakdown across periods (paid/shipped/delivered).
  const now = new Date().getTime();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYear = new Date(nowDate.getFullYear(), 0, 1);
  const startOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
  const startOfLastMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1);

  const revToday = realizedRevenueBetween(orders, startOfToday.getTime());
  const rev7d = realizedRevenueBetween(orders, now - 7 * 86_400_000);
  const rev30d = realizedRevenueBetween(orders, now - 30 * 86_400_000);
  const revYear = realizedRevenueBetween(orders, startOfYear.getTime());

  // This month vs. last month → growth indicator.
  const revThisMonth = realizedRevenueBetween(orders, startOfMonth.getTime());
  const revLastMonth = realizedRevenueBetween(
    orders,
    startOfLastMonth.getTime(),
    startOfMonth.getTime(),
  );
  const momDelta =
    revLastMonth > 0
      ? Math.round(((revThisMonth - revLastMonth) / revLastMonth) * 100)
      : null;

  // Realized orders (paid/shipped/delivered) → average order value & top sellers.
  const realizedOrders = orders.filter((o) => REALIZED.has(o.status));
  const aovCents =
    realizedOrders.length > 0
      ? Math.round(
          realizedOrders.reduce((s, o) => s + o.subtotalCents, 0) /
            realizedOrders.length,
        )
      : 0;

  // Order-status distribution (operational pulse — shown to everyone).
  const countBy = (pred: (s: string) => boolean) =>
    orders.filter((o) => pred(o.status)).length;
  const statusSegments = [
    { label: "Offen", count: countBy((s) => s === "pending" || s === "demo"), color: "var(--muted)" },
    { label: "Bezahlt", count: countBy((s) => s === "paid"), color: "var(--gold)" },
    { label: "Versandt", count: countBy((s) => s === "shipped" || s === "delivered"), color: "#34d399" },
    { label: "Storniert", count: countBy((s) => s === "cancelled"), color: "#f87171" },
  ].filter((s) => s.count > 0);
  const statusTotal = statusSegments.reduce((s, x) => s + x.count, 0);

  const sellerMap = new Map<string, { name: string; qty: number; revenueCents: number }>();
  for (const o of realizedOrders) {
    for (const it of o.items) {
      const cur = sellerMap.get(it.slug) ?? { name: it.name, qty: 0, revenueCents: 0 };
      cur.qty += it.qty;
      cur.revenueCents += it.priceCents * it.qty;
      sellerMap.set(it.slug, cur);
    }
  }
  const topSellers = Array.from(sellerMap.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 6);
  const topSellerMax = topSellers[0]?.revenueCents ?? 0;

  // Paid orders awaiting shipment — the core fulfilment queue.
  const toShip = orders.filter((o) => o.status === "paid").slice(0, 8);

  // Low / out-of-stock items (operational — shown to all back-office roles).
  const lowStock = products
    .filter((p) => typeof p.stock === "number" && (p.stock as number) <= 5)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      {/* Greeting */}
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            {dateLabel}
          </span>
          <h1
            className="mt-2 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              lineHeight: 1,
            }}
          >
            {firstName ? `Willkommen zurück, ${firstName}.` : "Willkommen zurück."}
          </h1>
        </div>
        <span className="rounded-full border border-border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
          {role}
        </span>
      </header>

      {/* Hero — month revenue (admins & owners only) */}
      {showRevenue && (
        <div className="mb-10 rounded-lg border border-border bg-foreground p-8 text-background md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
                Umsatz · {MONTHS[nowDate.getMonth()]}
              </div>
              <div
                className="mt-3 font-serif tabular-nums"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  lineHeight: 1,
                }}
              >
                {formatPrice(revThisMonth, "de")}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
                <span>Heute · {formatPrice(revToday, "de")}</span>
                <span className="opacity-40">|</span>
                <span>7 Tage · {formatPrice(rev7d, "de")}</span>
                <span className="opacity-40">|</span>
                <span>Jahr · {formatPrice(revYear, "de")}</span>
              </div>
            </div>
            {momDelta !== null && (
              <div className="rounded-full bg-background/10 px-4 py-2 font-mono text-[11px] tracking-[0.15em]">
                <span className="opacity-60">vs. Vormonat&nbsp;</span>
                <span style={{ color: momDelta >= 0 ? "#34d399" : "#f87171" }}>
                  {momDelta >= 0 ? "▲" : "▼"} {Math.abs(momDelta)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Produkte"
          value={String(products.length)}
          href="/admin/products"
          icon={<BoxIcon />}
        />
        <Stat
          label="Bestellungen"
          value={String(orders.length)}
          href="/admin/orders"
          icon={<BagIcon />}
        />
        <Stat
          label="Heute"
          value={String(ordersToday.length)}
          icon={<CalendarIcon />}
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
        <Stat
          label="Pending / Paid"
          value={String(pendingCount)}
          sub="zu versenden"
          icon={<TruckIcon />}
          href="/admin/orders"
        />
      </div>

      {/* Order-status distribution */}
      {statusTotal > 0 && (
        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Bestellstatus · {statusTotal}
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted-bg">
            {statusSegments.map((s) => (
              <div
                key={s.label}
                style={{
                  width: `${(s.count / statusTotal) * 100}%`,
                  background: s.color,
                }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {statusSegments.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {s.label}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-foreground">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Revenue breakdown by period (admins & owners only) */}
      {showRevenue && (
        <div className="mt-10">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Umsatz · Zeiträume
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RevenueStat label="Heute" value={formatPrice(revToday, "de")} />
            <RevenueStat label="7 Tage" value={formatPrice(rev7d, "de")} />
            <RevenueStat label="30 Tage" value={formatPrice(rev30d, "de")} />
            <RevenueStat
              label={`Jahr ${nowDate.getFullYear()}`}
              value={formatPrice(revYear, "de")}
            />
          </div>
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

      {/* Top sellers + AOV (admins & owners only) */}
      {showRevenue && (
        <div className="mt-10 grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Top-Seller · realisiert
            </div>
            {topSellers.length === 0 ? (
              <p className="text-sm text-muted">Noch keine Verkäufe.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {topSellers.map((p, i) => (
                  <li key={p.slug} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 font-mono text-[10px] text-muted tabular-nums">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/admin/products/${p.slug}`}
                          className="min-w-0 flex-1 truncate underline-offset-4 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted tabular-nums">
                          {p.qty}×
                        </span>
                        <span className="w-24 whitespace-nowrap text-right tabular-nums">
                          {formatPrice(p.revenueCents, "de")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div
                          className="h-full rounded-full bg-foreground/70"
                          style={{
                            width: `${topSellerMax > 0 ? (p.revenueCents / topSellerMax) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-md border border-border bg-card p-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Ø Bestellwert
            </div>
            <div
              className="font-serif tabular-nums"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1,
              }}
            >
              {aovCents === 0 ? "—" : formatPrice(aovCents, "de")}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              {realizedOrders.length} realisierte Bestellungen
            </div>
          </div>
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
                <StatusBadge status={o.status} />
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

/* ── Status badge ───────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending: { label: "offen", cls: "border-border text-muted" },
  demo: { label: "demo", cls: "border-border text-muted" },
  paid: { label: "bezahlt", cls: "border-[var(--gold)] text-[var(--gold)]" },
  shipped: { label: "versandt", cls: "border-emerald-500/50 text-emerald-500" },
  delivered: { label: "geliefert", cls: "border-emerald-500/50 text-emerald-500" },
  cancelled: { label: "storniert", cls: "border-red-400/50 text-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "border-border text-muted" };
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

/* ── Cards ──────────────────────────────────────────────────────────────── */

function RevenueStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div
        className="mt-3 font-serif tabular-nums"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.75rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  href,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const Inner = (
    <div className="group rounded-md border border-border bg-card p-5 transition-colors hover:border-foreground/40">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {label}
        </div>
        {icon && <span className="text-muted transition-colors group-hover:text-foreground">{icon}</span>}
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

/* ── Icons ──────────────────────────────────────────────────────────────── */

function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </svg>
  );
}
