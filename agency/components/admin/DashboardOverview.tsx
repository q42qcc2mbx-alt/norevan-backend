"use client";

import {
  ArrowRight,
  FolderKanban,
  Gauge,
  Inbox,
  MessageSquareHeart,
  ScanSearch,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// Presentational overview for the team dashboard. Receives the already-loaded
// rows from /admin and turns them into a light, on-brand snapshot.

interface AnalyseRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  website: string;
  score: number | null;
}
interface LeadRow {
  id: string;
  created_at: string;
  email: string;
  source: string;
}
interface ProjectRow {
  status: string;
}
interface FeedbackRow {
  done: boolean;
}

interface Props {
  analysen: AnalyseRow[];
  leads: LeadRow[];
  projekte: ProjectRow[];
  feedbacks: FeedbackRow[];
  admins: string[];
  onNavigate: (tab: string) => void;
}

const FUNNEL_MARKER = "(Funnel-Lead)";

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.round(hours / 24);
  if (days < 30) return `vor ${days} Tg.`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function scoreColor(score: number) {
  return score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
}

export default function DashboardOverview({
  analysen,
  leads,
  projekte,
  feedbacks,
  admins,
  onNavigate,
}: Props) {
  const funnelLeads = analysen.filter((a) => a.name === FUNNEL_MARKER);
  const scored = analysen.filter((a) => typeof a.score === "number") as (AnalyseRow & {
    score: number;
  })[];
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, a) => sum + a.score, 0) / scored.length)
    : null;
  const openProjects = projekte.filter((p) => p.status !== "fertig").length;
  const newFeedback = feedbacks.filter((f) => !f.done).length;

  const now = new Date();
  const thisMonth = analysen.filter((a) => {
    const d = new Date(a.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const dist = {
    good: scored.filter((a) => a.score >= 80).length,
    mid: scored.filter((a) => a.score >= 50 && a.score < 80).length,
    low: scored.filter((a) => a.score < 50).length,
  };
  const distTotal = Math.max(1, scored.length);

  // Merge analyses + leads into one recent-activity feed.
  const activity = [
    ...analysen.map((a) => ({
      id: `a-${a.id}`,
      date: a.created_at,
      kind: a.name === FUNNEL_MARKER ? ("funnel" as const) : ("analyse" as const),
      title: a.website || a.email,
      sub: a.email,
      score: a.score,
    })),
    ...leads.map((l) => ({
      id: `l-${l.id}`,
      date: l.created_at,
      kind: "lead" as const,
      title: l.email,
      sub: l.source,
      score: null as number | null,
    })),
  ]
    .sort((x, y) => +new Date(y.date) - +new Date(x.date))
    .slice(0, 6);

  const kpis = [
    {
      label: "Analysen gesamt",
      value: analysen.length,
      hint: `${thisMonth} diesen Monat`,
      icon: ScanSearch,
      tab: "analysen",
      accent: false,
    },
    {
      label: "Funnel-Leads",
      value: funnelLeads.length,
      hint: "über die Startseite",
      icon: Sparkles,
      tab: "analysen",
      accent: true,
    },
    {
      label: "Anfragen",
      value: leads.length,
      hint: "Kontakt & Formulare",
      icon: Inbox,
      tab: "anfragen",
      accent: false,
    },
    {
      label: "Ø Website-Score",
      value: avgScore ?? "–",
      hint: avgScore !== null ? "von 100 Punkten" : "noch keine Daten",
      icon: Gauge,
      tab: "analysen",
      accent: false,
    },
    {
      label: "Offene Projekte",
      value: openProjects,
      hint: "in Bearbeitung",
      icon: FolderKanban,
      tab: "projekte",
      accent: false,
    },
    {
      label: "Neues Feedback",
      value: newFeedback,
      hint: `${admins.length} Team-Mitglieder`,
      icon: MessageSquareHeart,
      tab: "feedback",
      accent: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {kpis.map(({ label, value, hint, icon: Icon, tab, accent }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(tab)}
            className={`group text-left transition-all ${
              accent
                ? "rounded-2xl bg-gradient-to-br from-accent to-cyan-glow p-5 text-white shadow-lg shadow-accent/25 hover:brightness-105"
                : "card-surface p-5"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  accent
                    ? "bg-white/20 text-white"
                    : "bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight
                className={`h-4 w-4 translate-x-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 ${
                  accent ? "text-white" : "text-accent"
                }`}
              />
            </div>
            <p
              className={`mt-4 font-display text-3xl font-bold ${accent ? "text-white" : "text-ink"}`}
            >
              {value}
            </p>
            <p className={`text-sm font-semibold ${accent ? "text-white" : "text-ink"}`}>{label}</p>
            <p className={`mt-0.5 text-xs ${accent ? "text-white/80" : "text-ink-muted"}`}>{hint}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Score distribution */}
        <div className="card-elevated p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <TrendingUp className="h-4.5 w-4.5 text-accent" />
            Score-Verteilung
          </h2>
          {scored.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Noch keine bewerteten Analysen.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {[
                { label: "Stark (80–100)", count: dist.good, color: "bg-emerald-500" },
                { label: "Mittel (50–79)", count: dist.mid, color: "bg-amber-500" },
                { label: "Kritisch (0–49)", count: dist.low, color: "bg-red-500" },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{label}</span>
                    <span className="font-bold text-ink-soft">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-edge">
                    <div
                      className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${(count / distTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-xs text-ink-muted">
                Über die Hälfte unter 50 Punkten? Das sind heiße Leads — hier lohnt sich der erste
                Anruf.
              </p>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card-elevated p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <Sparkles className="h-4.5 w-4.5 text-accent" />
            Letzte Aktivität
          </h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Noch keine Aktivität — sobald Besucher
              scannen oder anfragen, erscheint es hier.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-edge bg-card px-3.5 py-2.5"
                >
                  {typeof item.score === "number" ? (
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${scoreColor(item.score)}`}
                    >
                      {item.score}
                    </span>
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Inbox className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {item.kind === "funnel"
                        ? "Funnel-Lead"
                        : item.kind === "analyse"
                          ? "Analyse"
                          : "Anfrage"}{" "}
                      · {item.sub}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{relativeDate(item.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
