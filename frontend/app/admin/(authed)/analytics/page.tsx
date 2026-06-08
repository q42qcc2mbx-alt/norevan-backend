import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getAnalytics } from "@/lib/analytics";
import { getAllOrders } from "@/lib/orders";
import { RevenueChart, type ChartPoint } from "@/components/admin/RevenueChart";
import { SalesMap } from "@/components/admin/SalesMap";
import { formatPrice } from "@/lib/format";
import { toISOCountry } from "@/lib/country";
import { cn } from "@/lib/cn";

const REALIZED = new Set(["paid", "shipped", "delivered"]);
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const HEAT_BUCKETS = 12; // 2-hour columns

export const metadata = {
  title: "Analytics — Norevan Admin",
  robots: { index: false, follow: false },
};

const RANGES = [7, 30, 90] as const;

/** ISO-3166 alpha-2 → flag emoji. */
function flag(cc: string): string {
  if (!/^[A-Za-z]{2}$/.test(cc)) return "🏳️";
  return String.fromCodePoint(
    ...cc
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
  );
}

const REGION = new Intl.DisplayNames(["de"], { type: "region" });
function countryName(cc: string): string {
  try {
    return REGION.of(cc.toUpperCase()) ?? cc;
  } catch {
    return cc;
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const sp = await searchParams;
  const days = RANGES.includes(Number(sp?.days) as (typeof RANGES)[number])
    ? Number(sp.days)
    : 30;

  const [data, orders] = await Promise.all([getAnalytics(days), getAllOrders(1000)]);

  // Orders placed within the window → conversion against unique visitors.
  const since = new Date().getTime() - days * 24 * 60 * 60 * 1000;
  const ordersInPeriod = orders.filter(
    (o) => new Date(o.createdAt).getTime() >= since,
  ).length;
  const visitors = data?.totals.visitors ?? 0;
  const conversion = visitors > 0 ? (ordersInPeriod / visitors) * 100 : 0;

  const series: ChartPoint[] = (data?.series ?? []).map((s) => {
    const [, m, d] = s.day.split("-");
    return { label: `${Number(d)}.${Number(m)}`, valueCents: s.visitors };
  });
  const maxDevice = Math.max(1, ...(data?.devices ?? []).map((d) => d.views));

  // Realized revenue by country (real orders) → ranked bars.
  const revByCountry = new Map<string, number>();
  for (const o of orders) {
    if (!REALIZED.has(o.status)) continue;
    const cc = toISOCountry(o.country);
    revByCountry.set(cc, (revByCountry.get(cc) ?? 0) + o.subtotalCents);
  }
  const topRevCountries = Array.from(revByCountry.entries())
    .map(([cc, cents]) => ({ cc, cents }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 6);
  const maxRev = Math.max(1, ...topRevCountries.map((c) => c.cents));
  const revByCountryRecord: Record<string, number> = Object.fromEntries(revByCountry);

  // Sales heatmap: weekday (Mon-first) × 2-hour bucket, counted from orders.
  const heat = Array.from({ length: 7 }, () => Array(HEAT_BUCKETS).fill(0));
  for (const o of orders) {
    const dt = new Date(o.createdAt);
    const wd = (dt.getDay() + 6) % 7; // 0 = Monday
    const bucket = Math.min(HEAT_BUCKETS - 1, Math.floor(dt.getHours() / 2));
    heat[wd][bucket] += 1;
  }
  const maxHeat = Math.max(1, ...heat.flat());

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Letzte {days} Tage
        </span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1
            className="font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              lineHeight: 1,
            }}
          >
            Analytics
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              {RANGES.map((r) => (
                <Link
                  key={r}
                  href={`/admin/analytics?days=${r}`}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    r === days ? "bg-foreground text-background" : "text-muted hover:text-foreground",
                  )}
                >
                  {r}T
                </Link>
              ))}
            </div>
            <a
              href={`/api/admin/analytics/export?days=${days}`}
              className="rounded-full border border-border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              CSV
            </a>
          </div>
        </div>
      </header>

      {!data ? (
        <p className="text-muted">Analytics konnten nicht geladen werden.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Besucher" value={data.totals.visitors.toLocaleString("de-DE")} />
            <Stat label="Seitenaufrufe" value={data.totals.views.toLocaleString("de-DE")} />
            <Stat label="Bestellungen" value={ordersInPeriod.toLocaleString("de-DE")} />
            <Stat label="Conversion" value={`${conversion.toFixed(1)} %`} />
            <Stat
              label="Gerade online"
              value={data.totals.online.toLocaleString("de-DE")}
              live
            />
          </div>

          {/* Visitors over time */}
          <div className="mt-10 rounded-md border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Besucher · Verlauf
            </div>
            <RevenueChart
              data={series}
              formatValue={(n) => String(Math.round(n))}
            />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {/* Top pages */}
            <Panel title="Top-Seiten">
              <List
                rows={data.topPages.map((p) => ({
                  key: p.path,
                  left: p.path,
                  right: p.views.toLocaleString("de-DE"),
                }))}
                empty="Noch keine Daten."
              />
            </Panel>

            {/* Top countries */}
            <Panel title="Top-Länder">
              <List
                rows={data.topCountries.map((c) => ({
                  key: c.country,
                  left: `${flag(c.country)}  ${countryName(c.country)}`,
                  right: c.views.toLocaleString("de-DE"),
                }))}
                empty="Noch keine Länderdaten (benötigt Geo-Header)."
              />
            </Panel>
          </div>

          {/* Devices */}
          <div className="mt-10 rounded-md border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Geräte
            </div>
            {data.devices.length === 0 ? (
              <p className="text-sm text-muted">Noch keine Daten.</p>
            ) : (
              <ul className="space-y-3">
                {data.devices.map((d) => (
                  <li key={d.device} className="flex items-center gap-3">
                    <span className="w-20 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      {d.device}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted-bg">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${(d.views / maxDevice) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm tabular-nums">
                      {d.views.toLocaleString("de-DE")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Umsatz nach Land — geographic map + ranked list (real orders) */}
          <div className="mt-10 rounded-md border border-border bg-card p-6">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Umsatz nach Land · Karte
            </div>
            {topRevCountries.length === 0 ? (
              <p className="text-sm text-muted">Noch keine Verkäufe.</p>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                <SalesMap revenueByCountry={revByCountryRecord} />
                <ul className="space-y-3 lg:border-l lg:border-border-subtle lg:pl-8">
                  {topRevCountries.map((c) => (
                    <li key={c.cc}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                        <span>{flag(c.cc)}&nbsp;&nbsp;{countryName(c.cc)}</span>
                        <span className="font-mono text-[11px] tabular-nums text-muted">
                          {formatPrice(c.cents, "de")}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(c.cents / maxRev) * 100}%`, background: "var(--gold)" }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Verkaufs-Heatmap — orders by weekday × time of day */}
          <div className="mt-10 rounded-md border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Verkaufs-Heatmap · Wochenverlauf (Bestellungen)
            </div>
            <div className="space-y-1.5">
              {heat.map((row, r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <span className="w-6 shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
                    {WEEKDAYS[r]}
                  </span>
                  <div className="flex flex-1 gap-1.5">
                    {row.map((v, c) => (
                      <div
                        key={c}
                        className="h-5 flex-1 rounded-sm"
                        style={{
                          background:
                            v === 0
                              ? "var(--muted-bg)"
                              : `color-mix(in oklab, var(--gold) ${15 + (v / maxHeat) * 85}%, transparent)`,
                        }}
                        title={`${WEEKDAYS[r]} ${String(c * 2).padStart(2, "0")}–${String(c * 2 + 2).padStart(2, "0")} Uhr · ${v} Bestellung(en)`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
              <span className="pl-7">00 Uhr</span>
              <span>12 Uhr</span>
              <span>24 Uhr</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  live,
}: {
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {live && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
        )}
        {label}
      </div>
      <div
        className="mt-3 font-serif tabular-nums"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {title}
      </div>
      {children}
    </div>
  );
}

function List({
  rows,
  empty,
}: {
  rows: { key: string; left: string; right: string }[];
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2.5 text-sm">
      {rows.map((r) => (
        <li key={r.key} className="flex items-center justify-between gap-3">
          <span className="truncate text-foreground">{r.left}</span>
          <span className="whitespace-nowrap tabular-nums text-muted">{r.right}</span>
        </li>
      ))}
    </ul>
  );
}
