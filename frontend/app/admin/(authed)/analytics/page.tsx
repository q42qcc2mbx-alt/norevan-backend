import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getAnalytics } from "@/lib/analytics";
import { RevenueChart, type ChartPoint } from "@/components/admin/RevenueChart";

export const metadata = {
  title: "Analytics — Norevan Admin",
  robots: { index: false, follow: false },
};

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

export default async function AnalyticsPage() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const data = await getAnalytics(30);

  const series: ChartPoint[] = (data?.series ?? []).map((s) => {
    const [, m, d] = s.day.split("-");
    return { label: `${Number(d)}.${Number(m)}`, valueCents: s.visitors };
  });
  const maxDevice = Math.max(1, ...(data?.devices ?? []).map((d) => d.views));

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Letzte 30 Tage
        </span>
        <h1
          className="mt-2 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
            lineHeight: 1,
          }}
        >
          Analytics
        </h1>
      </header>

      {!data ? (
        <p className="text-muted">Analytics konnten nicht geladen werden.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Besucher" value={data.totals.visitors.toLocaleString("de-DE")} />
            <Stat label="Seitenaufrufe" value={data.totals.views.toLocaleString("de-DE")} />
            <Stat label="Heute" value={data.totals.today.toLocaleString("de-DE")} />
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
