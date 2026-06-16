"use client";

import { Inbox, ScanSearch, Sparkles, TrendingUp, Users } from "lucide-react";

// Lead statistics & conversion charts — computed from the data already loaded
// by /admin (no extra fetch). Pure CSS bars, no chart library.

interface Row {
  created_at: string;
  status?: string | null;
  name?: string;
}
interface Props {
  analysen: Row[];
  leads: Row[];
}

const FUNNEL_MARKER = "(Funnel-Lead)";
const WEEKS = 8;

function weekKey(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x.getTime();
}

export default function AdminAnalytics({ analysen, leads }: Props) {
  const all = [...analysen, ...leads];
  const now = new Date();

  const inWindow = (r: Row, fromDays: number, toDays: number) => {
    const t = new Date(r.created_at).getTime();
    return t >= now.getTime() - fromDays * 864e5 && t < now.getTime() - toDays * 864e5;
  };
  const thisWeek = all.filter((r) => inWindow(r, 7, 0)).length;
  const lastWeek = all.filter((r) => inWindow(r, 14, 7)).length;
  const delta = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

  const funnelLeads = analysen.filter((a) => a.name === FUNNEL_MARKER).length;

  // Weekly buckets (last 8 weeks)
  const buckets: { key: number; analyses: number; leads: number }[] = [];
  const startMonday = weekKey(now);
  for (let i = WEEKS - 1; i >= 0; i--) buckets.push({ key: startMonday - i * 7 * 864e5, analyses: 0, leads: 0 });
  const idxByKey = new Map(buckets.map((b, i) => [b.key, i]));
  for (const a of analysen) {
    const i = idxByKey.get(weekKey(new Date(a.created_at)));
    if (i != null) buckets[i].analyses++;
  }
  for (const l of leads) {
    const i = idxByKey.get(weekKey(new Date(l.created_at)));
    if (i != null) buckets[i].leads++;
  }
  const maxBar = Math.max(1, ...buckets.map((b) => b.analyses + b.leads));

  // Status pipeline
  const STATUS = ["neu", "kontaktiert", "Kunde", "verloren"];
  const statusCount = (s: string) => all.filter((r) => (r.status ?? "neu") === s).length;

  // Conversion funnel
  const received = all.length;
  const contacted = all.filter((r) => r.status === "kontaktiert" || r.status === "Kunde").length;
  const won = all.filter((r) => r.status === "Kunde").length;
  const rate = (n: number) => (received ? Math.round((n / received) * 100) : 0);

  const kpis = [
    { label: "Eingegangen gesamt", value: received, icon: Inbox },
    { label: "Funnel-Leads", value: funnelLeads, icon: Sparkles },
    { label: "Analysen", value: analysen.length, icon: ScanSearch },
    { label: "Kunden gewonnen", value: won, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs + weekly delta */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-bold text-ink">{value}</p>
            <p className="text-sm font-semibold text-ink">{label}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <TrendingUp className="h-4.5 w-4.5 text-accent" />
            Anfragen pro Woche
          </h2>
          <span
            className={`text-sm font-bold ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs. Vorwoche
          </span>
        </div>
        <div className="mt-6 flex h-44 items-end justify-between gap-2">
          {buckets.map((b) => {
            const total = b.analyses + b.leads;
            const d = new Date(b.key);
            return (
              <div key={b.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-ink-soft">{total || ""}</span>
                <div
                  className="flex w-full max-w-[2.5rem] flex-col justify-end overflow-hidden rounded-t-md"
                  style={{ height: `${(total / maxBar) * 100}%`, minHeight: total ? "4px" : "2px" }}
                >
                  <div className="bg-cyan-glow" style={{ height: `${total ? (b.leads / total) * 100 : 0}%` }} />
                  <div className="flex-1 bg-accent" />
                </div>
                <span className="text-[10px] text-ink-muted">
                  {d.getDate()}.{d.getMonth() + 1}.
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Analysen</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-cyan-glow" /> Anfragen</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversion funnel */}
        <div className="card-elevated p-6">
          <h2 className="text-base font-bold text-ink">Conversion-Funnel</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: "Eingegangen", n: received, pct: 100, color: "bg-accent" },
              { label: "Kontaktiert", n: contacted, pct: rate(contacted), color: "bg-accent/70" },
              { label: "Kunde geworden", n: won, pct: rate(won), color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-ink">{s.label}</span>
                  <span className="font-bold text-ink-soft">{s.n} · {s.pct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-edge">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status pipeline */}
        <div className="card-elevated p-6">
          <h2 className="text-base font-bold text-ink">Status-Pipeline</h2>
          <div className="mt-5 space-y-3">
            {STATUS.map((s) => {
              const n = statusCount(s);
              const color =
                s === "Kunde" ? "bg-emerald-500" : s === "verloren" ? "bg-red-400" : s === "kontaktiert" ? "bg-amber-500" : "bg-accent";
              return (
                <div key={s}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-ink capitalize">{s}</span>
                    <span className="font-bold text-ink-soft">{n}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-edge">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${received ? (n / received) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
