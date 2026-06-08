import { formatPrice } from "@/lib/format";

// Dependency-free Europe "tile-grid" map (cartogram): every country is a square
// placed at its rough geographic spot, shaded by realized revenue (gold). It
// reads clearly as a Karte without needing heavy geo libraries or assets.

// [column, row] on a 9×7 grid, roughly geographic.
const GRID: Record<string, [number, number]> = {
  IS: [0, 0],
  NO: [6, 0], SE: [7, 0], FI: [8, 0],
  IE: [0, 1], GB: [1, 1], DK: [6, 1], EE: [8, 1],
  NL: [5, 2], DE: [6, 2], PL: [7, 2], LV: [8, 2],
  BE: [4, 3], LU: [5, 3], CZ: [6, 3], SK: [7, 3], LT: [8, 3],
  FR: [3, 3], CH: [5, 4], AT: [6, 4], HU: [7, 4], RO: [8, 4],
  PT: [2, 5], ES: [3, 5], IT: [5, 5], SI: [6, 5], HR: [7, 5], RS: [8, 5],
  GR: [7, 6], BG: [8, 6],
};
const COLS = 9;
const ROWS = 7;

const REGION = new Intl.DisplayNames(["de"], { type: "region" });
function countryName(cc: string): string {
  try {
    return REGION.of(cc.toUpperCase()) ?? cc;
  } catch {
    return cc;
  }
}

export function SalesMap({
  revenueByCountry,
}: {
  // ISO alpha-2 (upper-case) → realized revenue in cents.
  revenueByCountry: Record<string, number>;
}) {
  const max = Math.max(1, ...Object.values(revenueByCountry));

  // Countries that have revenue but aren't on the European grid (rest of world).
  const offGrid = Object.entries(revenueByCountry)
    .filter(([cc, cents]) => cents > 0 && !GRID[cc])
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, auto)`,
        }}
      >
        {Object.entries(GRID).map(([cc, [col, row]]) => {
          const cents = revenueByCountry[cc] ?? 0;
          const intensity = cents > 0 ? 0.15 + (cents / max) * 0.85 : 0;
          return (
            <div
              key={cc}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                background:
                  intensity === 0
                    ? "var(--muted-bg)"
                    : `color-mix(in oklab, var(--gold) ${intensity * 100}%, transparent)`,
              }}
              title={
                cents > 0
                  ? `${countryName(cc)}: ${formatPrice(cents, "de")}`
                  : `${countryName(cc)}: kein Umsatz`
              }
              className="flex aspect-square items-center justify-center rounded-sm border border-border-subtle"
            >
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.1em] ${
                  cents > 0 ? "text-foreground" : "text-muted"
                }`}
              >
                {cc}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
          weniger
          <span className="flex gap-1">
            {[20, 45, 70, 95].map((o) => (
              <span
                key={o}
                className="h-3 w-3 rounded-sm"
                style={{ background: `color-mix(in oklab, var(--gold) ${o}%, transparent)` }}
              />
            ))}
          </span>
          mehr
        </div>
        {offGrid.length > 0 && (
          <div className="text-right font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
            + {offGrid.length} weitere{offGrid.length === 1 ? "s" : ""} Land
            {offGrid.length === 1 ? "" : "er"}:{" "}
            {offGrid
              .slice(0, 4)
              .map(([cc]) => cc)
              .join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
