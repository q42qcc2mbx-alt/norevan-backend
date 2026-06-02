/**
 * RevenueChart — a dependency-free SVG line chart ("Koordinatensystem").
 * Server-renderable (no hooks): plots a daily revenue series with axes,
 * gridlines, an area fill and point markers, styled via brand CSS variables.
 */

export type ChartPoint = { label: string; valueCents: number };

const W = 720;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 30, left: 56 };

function niceMax(v: number) {
  if (v <= 0) return 1000; // €10 default ceiling
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function euroShort(cents: number) {
  const eur = cents / 100;
  if (eur >= 1000) return `€${(eur / 1000).toFixed(eur % 1000 === 0 ? 0 : 1)}k`;
  return `€${Math.round(eur)}`;
}

export function RevenueChart({
  data,
  className,
}: {
  data: ChartPoint[];
  className?: string;
}) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(0, ...data.map((d) => d.valueCents)));
  const n = data.length;

  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.valueCents).toFixed(1)}`)
    .join(" ");
  const areaPath =
    n > 0
      ? `${linePath} L${x(n - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} ` +
        `L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`
      : "";

  const gridSteps = 4;
  const yTicks = Array.from({ length: gridSteps + 1 }, (_, i) => (max / gridSteps) * i);

  // Show ~6 x labels evenly to avoid crowding.
  const labelEvery = Math.max(1, Math.ceil(n / 6));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Umsatzverlauf"
    >
      {/* horizontal gridlines + y labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={y(t) + 3}
            textAnchor="end"
            fontSize={10}
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            {euroShort(t)}
          </text>
        </g>
      ))}

      {/* x axis baseline */}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={PAD.top + innerH}
        y2={PAD.top + innerH}
        stroke="var(--border)"
        strokeWidth={1}
      />

      {/* area + line */}
      {n > 0 && (
        <>
          <path d={areaPath} fill="var(--foreground)" opacity={0.06} />
          <path
            d={linePath}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {data.map((d, i) => (
            <circle key={i} cx={x(i)} cy={y(d.valueCents)} r={1.8} fill="var(--foreground)" />
          ))}
        </>
      )}

      {/* x labels */}
      {data.map((d, i) =>
        i % labelEvery === 0 || i === n - 1 ? (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            {d.label}
          </text>
        ) : null,
      )}

      {n === 0 && (
        <text
          x={W / 2}
          y={H / 2}
          textAnchor="middle"
          fontSize={12}
          fill="var(--muted)"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          Noch keine Umsatzdaten
        </text>
      )}
    </svg>
  );
}
