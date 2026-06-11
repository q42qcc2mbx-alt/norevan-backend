import { redirect } from "next/navigation";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { buildSnapshot } from "@/lib/jarvis/snapshot";
import { listTasks } from "@/lib/jarvis/store";
import { JarvisChat } from "@/components/admin/jarvis/JarvisChat";
import { MemoryTasks } from "@/components/admin/jarvis/MemoryTasks";
import { Findings } from "@/components/admin/jarvis/Findings";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "JARVIS OMEGA — Norevan",
  robots: { index: false, follow: false },
};

export default async function JarvisPage() {
  const user = await getAdminUser();
  if (!user || effectiveRole(user) !== "owner") redirect("/admin");

  const [snapshot, tasks] = await Promise.all([buildSnapshot(), listTasks()]);
  const openTasks = tasks.filter((t) => t.status === "open").length;
  const greeting =
    new Date().getHours() < 12 ? "Guten Morgen" : new Date().getHours() < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div className="jarvis-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {/* ── Hero: arc reactor + title ── */}
        <header className="mb-10 flex flex-wrap items-center gap-6">
          <div className="jarvis-reactor relative grid h-24 w-24 shrink-0 place-items-center rounded-full">
            <div className="jarvis-reactor-ring absolute inset-0 rounded-full" />
            <div className="jarvis-reactor-ring2 absolute inset-2 rounded-full" />
            <div className="jarvis-core h-8 w-8 rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1
                className="jarvis-title"
                style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "clamp(1.5rem, 4vw, 2.4rem)", letterSpacing: "0.18em" }}
              >
                JARVIS&nbsp;OMEGA
              </h1>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                online
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {greeting}, {user.username}. Alle Systeme laufen — hier ist dein Briefing.
            </p>
          </div>
        </header>

        {/* ── Command Center ── */}
        <section className="mb-8">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
            ⌬ Owner Command Center
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Umsatz heute" value={formatPrice(snapshot.revenue.todayCents, "de")} />
            <Stat label="Umsatz 7 Tage" value={formatPrice(snapshot.revenue.week7Cents, "de")} />
            <Stat label="Bestellungen heute" value={String(snapshot.orders.today)} />
            <Stat label="Gerade online" value={String(snapshot.visitors.online)} live />
            <Stat label="Conversion 30T" value={`${snapshot.visitors.conversionPct.toFixed(1)} %`} />
            <Stat label="Offene Aufgaben" value={String(openTasks)} />
          </div>
        </section>

        {/* ── Daily Briefing + Proactive findings ── */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="jarvis-panel rounded-2xl p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              📊 Daily Briefing
            </div>
            <ul className="space-y-2.5 text-sm">
              <Brief k="Umsatz 30 Tage" v={formatPrice(snapshot.revenue.days30Cents, "de")} />
              <Brief k="Umsatz gesamt" v={formatPrice(snapshot.revenue.totalCents, "de")} />
              <Brief k="Besucher (30 T)" v={snapshot.visitors.last30d.toLocaleString("de-DE")} />
              <Brief k="Offene (unbezahlte) Bestellungen" v={String(snapshot.orders.pendingOpen)} />
              <Brief
                k="Topseller"
                v={snapshot.topSellers[0] ? `${snapshot.topSellers[0].name} (${snapshot.topSellers[0].qty}×)` : "—"}
              />
              <Brief k="Produkte im Katalog" v={String(snapshot.productCount)} />
            </ul>
          </div>
          <div className="jarvis-panel rounded-2xl p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              ⚡ Proaktiver Modus · Befunde
            </div>
            <Findings findings={snapshot.findings} />
          </div>
        </section>

        {/* ── Chat console ── */}
        <section className="mb-8">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
            ◉ Sprach- & Textkonsole
          </div>
          <JarvisChat />
        </section>

        {/* ── Memory + tasks ── */}
        <section>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
            🧠 Gedächtnis & Aufgaben
          </div>
          <MemoryTasks />
        </section>

        <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
          Jarvis Omega · exklusiv für den Owner · {snapshot.orders.total} Bestellungen analysiert
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="jarvis-panel rounded-xl p-4">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        {live && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
        )}
        {label}
      </div>
      <div className="mt-2 text-xl font-medium tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function Brief({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border-subtle pb-2">
      <span className="text-muted">{k}</span>
      <span className="whitespace-nowrap tabular-nums">{v}</span>
    </li>
  );
}
