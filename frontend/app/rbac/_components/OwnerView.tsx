"use client";

import { PageTitle, Card, StatCard, BarChart, RegionBars, formatPrice } from "./ui";
import { OrdersPanel, SupportPanel, InventoryPanel } from "./AdminView";
import {
  KPIS,
  REVENUE_BY_MONTH,
  REVENUE_BY_REGION,
  EMPLOYEES,
} from "../_lib/data";

// High-end, analytical, strategic. The "big picture" — and as super-user the
// owner can also reach the operational admin tools (Operatives tab).

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Deterministic pseudo-intensities for the sales heatmap (24h × 7d condensed).
const HEAT = WEEKDAYS.map((d, r) =>
  Array.from({ length: 12 }, (_, c) => ((r * 7 + c * 3) % 10) / 10),
);

function Overview() {
  return (
    <div>
      <PageTitle eyebrow="Geschäftsführung" title="Das große Ganze" sub="Umsatz, Marge & Conversion auf einen Blick." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard invert label="Gesamtumsatz" value={formatPrice(KPIS.totalRevenueCents, "de")} delta={{ pct: 19 }} />
        <StatCard label="Profitmarge" value={`${KPIS.profitMarginPct}%`} delta={{ pct: 2 }} />
        <StatCard label="Conversion-Rate" value={`${KPIS.conversionRatePct}%`} delta={{ pct: -1 }} />
        <StatCard label="Ø Bestellwert" value={formatPrice(KPIS.aovCents, "de")} delta={{ pct: 4 }} />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Umsatz · 6 Monate
          </div>
          <BarChart data={REVENUE_BY_MONTH} />
        </Card>
        <Card>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Umsatz nach Region
          </div>
          <RegionBars data={REVENUE_BY_REGION} />
        </Card>
      </div>
    </div>
  );
}

function Finance() {
  const total = REVENUE_BY_MONTH.reduce((s, m) => s + m.valueCents, 0);
  const profit = Math.round(total * (KPIS.profitMarginPct / 100));
  return (
    <div>
      <PageTitle eyebrow="Finanzen" title="Finanzübersicht" sub="Sensibel — nur für die Geschäftsführung." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard invert label="Umsatz (H1)" value={formatPrice(total, "de")} />
        <StatCard label="Profit (H1)" value={formatPrice(profit, "de")} />
        <StatCard label="Kosten (H1)" value={formatPrice(total - profit, "de")} />
      </div>
      <Card className="mt-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Monatliche Aufschlüsselung
        </div>
        <div className="divide-y divide-border-subtle">
          {REVENUE_BY_MONTH.map((m) => {
            const p = Math.round(m.valueCents * (KPIS.profitMarginPct / 100));
            return (
              <div key={m.label} className="grid grid-cols-3 gap-3 py-3 text-sm tabular-nums">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{m.label}</span>
                <span className="text-right">{formatPrice(m.valueCents, "de")}</span>
                <span className="text-right text-emerald-500">+{formatPrice(p, "de")}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Analytics() {
  return (
    <div>
      <PageTitle eyebrow="Strategie" title="Strategische Analytics" sub="Verkaufs-Heatmap & Regionen." />
      <Card>
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Verkaufs-Heatmap · Wochenverlauf
        </div>
        <div className="space-y-1.5">
          {HEAT.map((row, r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className="w-6 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
                {WEEKDAYS[r]}
              </span>
              <div className="flex flex-1 gap-1.5">
                {row.map((v, c) => (
                  <div
                    key={c}
                    className="h-5 flex-1 rounded-sm"
                    style={{ background: `color-mix(in oklab, var(--gold) ${10 + v * 90}%, transparent)` }}
                    title={`${Math.round(v * 100)}%`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
          weniger
          <span className="flex gap-1">
            {[20, 45, 70, 95].map((o) => (
              <span key={o} className="h-3 w-3 rounded-sm" style={{ background: `color-mix(in oklab, var(--gold) ${o}%, transparent)` }} />
            ))}
          </span>
          mehr
        </div>
      </Card>
      <Card className="mt-4">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Umsatz nach Region
        </div>
        <RegionBars data={REVENUE_BY_REGION} />
      </Card>
    </div>
  );
}

function Team() {
  const ROLE_LABEL: Record<string, string> = { owner: "Inhaber", admin: "Admin", staff: "Mitarbeiter" };
  return (
    <div>
      <PageTitle eyebrow="Organisation" title="Mitarbeiter-Verwaltung" />
      <Card className="p-0">
        <div className="divide-y divide-border-subtle">
          {EMPLOYEES.map((e) => (
            <div key={e.email} className="flex flex-wrap items-center gap-3 px-6 py-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm">{e.name}</div>
                <div className="font-mono text-[10px] text-muted">{e.email}</div>
              </div>
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                {ROLE_LABEL[e.role] ?? e.role}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Operations() {
  return (
    <div className="space-y-8">
      <PageTitle eyebrow="Super-User" title="Operatives" sub="Voller Zugriff auf die Admin-Tools." />
      <OrdersPanel />
      <SupportPanel />
      <InventoryPanel />
    </div>
  );
}

export function OwnerView({ active }: { active: string }) {
  switch (active) {
    case "finance":
      return <Finance />;
    case "analytics":
      return <Analytics />;
    case "team":
      return <Team />;
    case "operations":
      return <Operations />;
    default:
      return <Overview />;
  }
}
