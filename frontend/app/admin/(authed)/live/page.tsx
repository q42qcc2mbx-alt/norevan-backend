import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getAllOrders } from "@/lib/orders";
import { toISOCountry } from "@/lib/country";
import { geocode } from "@/lib/geocode";
import { SalesGeoMap, type SalesPoint } from "@/components/admin/SalesGeoMap";
import { LiveOrders } from "@/components/admin/LiveOrders";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Standorte & Live — Norevan Admin",
  robots: { index: false, follow: false },
};

const REGION = new Intl.DisplayNames(["de"], { type: "region" });
function deName(cc: string): string {
  try {
    return REGION.of(cc) ?? cc;
  } catch {
    return cc;
  }
}

export default async function LivePage() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const orders = await getAllOrders(1000);

  // Aggregate non-cancelled orders by city (+ country) → one map marker each.
  const cityMap = new Map<
    string,
    { city: string; zip: string; country: string; cents: number; count: number }
  >();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const city = (o.city ?? "").trim();
    if (!city) continue;
    const cc = toISOCountry(o.country);
    const key = `${city.toLowerCase()}|${cc}`;
    const prev =
      cityMap.get(key) ?? { city, zip: o.zip ?? "", country: cc, cents: 0, count: 0 };
    prev.cents += o.subtotalCents;
    prev.count += 1;
    cityMap.set(key, prev);
  }

  const aggs = Array.from(cityMap.values()).slice(0, 60);
  const points = (
    await Promise.all(
      aggs.map(async (a): Promise<SalesPoint | null> => {
        const g = await geocode(`${a.city} ${a.zip} ${deName(a.country)}`.trim());
        return g
          ? {
              city: a.city,
              country: a.country,
              lat: g.lat,
              lon: g.lon,
              cents: a.cents,
              count: a.count,
            }
          : null;
      }),
    )
  ).filter((p): p is SalesPoint => p !== null);

  const totalCents = aggs.reduce((s, a) => s + a.cents, 0);
  const totalOrders = aggs.reduce((s, a) => s + a.count, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-8 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Echtzeit
        </span>
        <h1
          className="mt-2"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
            lineHeight: 1,
          }}
        >
          Standorte &amp; Live-Bestellungen
        </h1>
        <p className="mt-3 text-sm text-muted">
          Jede Stadt, in der verkauft wurde — und der laufende Bestelleingang.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Städte" value={String(points.length)} />
        <Stat label="Bestellungen" value={String(totalOrders)} />
        <Stat label="Umsatz (Karte)" value={formatPrice(totalCents, "de")} />
      </div>

      <SalesGeoMap points={points} />

      <div className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
        <span className="inline-block h-3 w-3 rounded-full border-2 border-[#15803d] bg-[#22c55e]/60" />
        Grün = Verkaufsstandort · Größe nach Umsatz
      </div>

      <div className="mt-10">
        <LiveOrders />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div
        className="mt-2 tabular-nums"
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
