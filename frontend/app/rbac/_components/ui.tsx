"use client";

import { formatPrice } from "@/lib/format";

// Small shared building blocks, styled with the Norevan brand tokens so the
// whole RBAC area matches the rest of the site.

const serif = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
} as const;

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
      {children}
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1
        className="mt-2"
        style={{ ...serif, fontSize: "clamp(1.6rem, 3vw, 2.5rem)", lineHeight: 1 }}
      >
        {title}
      </h1>
      {sub && <p className="mt-3 text-sm text-muted">{sub}</p>}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  invert = false,
}: {
  label: string;
  value: string;
  delta?: { pct: number };
  invert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        invert ? "border-foreground bg-foreground text-background" : "border-border bg-card"
      }`}
    >
      <div className={`font-mono text-[10px] uppercase tracking-[0.25em] ${invert ? "opacity-60" : "text-muted"}`}>
        {label}
      </div>
      <div className="mt-3 tabular-nums" style={{ ...serif, fontSize: "clamp(1.8rem, 4vw, 2.75rem)", lineHeight: 1 }}>
        {value}
      </div>
      {delta && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em]">
          <span style={{ color: delta.pct >= 0 ? "#34d399" : "#f87171" }}>
            {delta.pct >= 0 ? "▲" : "▼"} {Math.abs(delta.pct)}%
          </span>{" "}
          <span className={invert ? "opacity-60" : "text-muted"}>vs. Vormonat</span>
        </div>
      )}
    </div>
  );
}

const STATUS_CLS: Record<string, string> = {
  offen: "border-[var(--gold)] text-[var(--gold)]",
  versendet: "border-emerald-500/50 text-emerald-500",
  geliefert: "border-emerald-500/50 text-emerald-500",
  storniert: "border-red-400/50 text-red-400",
  beantwortet: "border-[var(--gold)] text-[var(--gold)]",
  geschlossen: "border-border text-muted",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${
        STATUS_CLS[status] ?? "border-border text-muted"
      }`}
    >
      {status}
    </span>
  );
}

/** Vertical bar chart (CSS only) for a money series. */
export function BarChart({ data }: { data: { label: string; valueCents: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.valueCents));
  return (
    <div className="flex items-end gap-3" style={{ height: 180 }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-foreground/80"
              style={{ height: `${(d.valueCents / max) * 100}%` }}
              title={formatPrice(d.valueCents, "de")}
            />
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Horizontal ranked bars — used for revenue by region. */
export function RegionBars({ data }: { data: { region: string; valueCents: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.valueCents));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.region}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span>{d.region}</span>
            <span className="tabular-nums font-mono text-[11px] text-muted">
              {formatPrice(d.valueCents, "de")}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.valueCents / max) * 100}%`, background: "var(--gold)" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export { formatPrice };
