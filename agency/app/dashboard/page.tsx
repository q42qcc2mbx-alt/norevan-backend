"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  CalendarClock,
  Check,
  FileDown,
  FolderKanban,
  Home,
  Loader2,
  LogOut,
  MessageSquareText,
  ScanSearch,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { getSupabase, PROJECT_STEPS, type ProjectStatus } from "@/lib/supabase";
import { navFor, type Role } from "@/lib/roles";
import AiWebsiteHelper from "@/components/AiWebsiteHelper";
import AccountSettings from "@/components/AccountSettings";
import ReportDetail from "@/components/ReportDetail";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "/kontakt";

interface AnalyseRow {
  id: string;
  created_at: string;
  website: string;
  goal: string | null;
  score: number | null;
  result: unknown;
}

interface ProjectRow {
  id: string;
  created_at: string;
  title: string;
  status: ProjectStatus;
  notes: string | null;
}

interface MessageRow {
  id: string;
  created_at: string;
  sender: "team" | "kunde";
  content: string;
}

const STEP_EMOJI: Record<ProjectStatus, string> = {
  analyse: "✅",
  planung: "✅",
  entwicklung: "🔄",
  testing: "⏳",
  fertig: "🚀",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function ProjectTimeline({ status }: { status: ProjectStatus }) {
  const currentIdx = PROJECT_STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="mt-4 flex items-center" aria-label="Projektfortschritt">
      {PROJECT_STEPS.map((step, i) => {
        const done = i < currentIdx || status === "fertig";
        const current = i === currentIdx && status !== "fertig";
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-accent text-white ring-4 ring-accent/20"
                      : "bg-edge text-ink-muted"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`mt-1.5 text-[10px] font-medium sm:text-xs ${
                  done || current ? "text-ink" : "text-ink-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < PROJECT_STEPS.length - 1 && (
              <span
                className={`mx-1 mb-5 h-0.5 flex-1 rounded sm:mx-2 ${
                  i < currentIdx || status === "fertig" ? "bg-emerald-500" : "bg-edge"
                }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analysen, setAnalysen] = useState<AnalyseRow[]>([]);
  const [projekte, setProjekte] = useState<ProjectRow[]>([]);
  const [nachrichten, setNachrichten] = useState<MessageRow[]>([]);
  const [report, setReport] = useState<AnalyseRow | null>(null);
  const [reply, setReply] = useState("");
  const [replySending, setReplySending] = useState(false);

  const load = useCallback(async (s: Session) => {
    const supabase = getSupabase();
    const email = s.user.email ?? "";
    const [a, p, m, adm] = await Promise.all([
      supabase
        .from("agency_analyses")
        .select("id, created_at, website, goal, score, result")
        .or(`user_id.eq.${s.user.id},email.ilike.${email}`)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("agency_projects")
        .select("id, created_at, title, status, notes")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("agency_messages")
        .select("id, created_at, sender, content")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase.from("agency_admins").select("email").limit(1),
    ]);
    setAnalysen(a.data ?? []);
    setProjekte((p.data ?? []) as ProjectRow[]);
    setNachrichten((m.data ?? []) as MessageRow[]);
    setIsAdmin((adm.data ?? []).length > 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) {
          router.replace("/login");
          return;
        }
        setSession(data.session);
        load(data.session);
      });
  }, [router, load]);

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  async function sendReply() {
    const content = reply.trim();
    if (!content || replySending || !session) return;
    setReplySending(true);
    const { error } = await getSupabase().from("agency_messages").insert({
      email: (session.user.email ?? "").toLowerCase(),
      sender: "kunde",
      content,
    });
    setReplySending(false);
    if (!error) {
      setReply("");
      load(session);
    }
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const name = (session.user.user_metadata?.name as string) || session.user.email;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-28 pb-20 md:px-8 md:pt-32">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Hallo, {name} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Ihr persönlicher Bereich — Analysen, Projekte und Nachrichten auf einen Blick.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <Home className="h-4 w-4" />
            Startseite
          </Link>
          {navFor((isAdmin ? "admin" : "kunde") as Role)
            .filter((item) => item.href !== "/dashboard")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  item.href === "/admin" ? "btn-primary" : "btn-secondary"
                } inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold`}
              >
                {item.href === "/admin" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : item.href === "/analyse" ? (
                  <ScanSearch className="h-4 w-4" />
                ) : (
                  <MessageSquareText className="h-4 w-4" />
                )}
                {item.label}
              </Link>
            ))}
          <a
            href={BOOKING_URL}
            target={BOOKING_URL.startsWith("http") ? "_blank" : undefined}
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <CalendarClock className="h-4 w-4" />
            Erstgespräch buchen
          </a>
          <button
            type="button"
            onClick={logout}
            className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </div>

      {/* KI-Texthilfe — exklusiv für eingeloggte Kunden */}
      <div className="mt-10">
        <AiWebsiteHelper />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        {/* Analysen */}
        <div className="card-elevated p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <ScanSearch className="h-4.5 w-4.5 text-accent" />
            Meine Analysen
          </h2>
          {analysen.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Noch keine Analysen.{" "}
              <Link href="/analyse" className="font-semibold text-accent hover:underline">
                Jetzt die erste starten →
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analysen.map((a) => (
                <li key={a.id} className="rounded-xl border border-edge bg-card p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                        (a.score ?? 0) >= 80 ? "bg-emerald-500" : (a.score ?? 0) >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                    >
                      {a.score ?? "–"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{a.website}</p>
                      <p className="text-xs text-ink-muted">
                        {formatDate(a.created_at)}
                        {a.goal ? ` · Ziel: ${a.goal.slice(0, 60)}${a.goal.length > 60 ? "…" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  {a.result != null && (
                    <button
                      type="button"
                      onClick={() => setReport(a)}
                      className="mt-3 text-xs font-semibold text-accent hover:underline"
                    >
                      Vollständigen Report ansehen →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Projekte */}
        <div className="card-elevated p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <FolderKanban className="h-4.5 w-4.5 text-accent" />
            Meine Projekte
          </h2>
          {projekte.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Noch kein laufendes Projekt. Nach Ihrem Auftrag verfolgen Sie hier
              jeden Schritt — von der Analyse bis zum Launch. 🚀
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {projekte.map((p) => (
                <li key={p.id} className="rounded-xl border border-edge bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">
                      {STEP_EMOJI[p.status]} {p.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent capitalize">
                      {p.status}
                    </span>
                  </div>
                  <ProjectTimeline status={p.status} />
                  {p.notes && <p className="mt-3 text-xs leading-relaxed text-ink-soft">{p.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Konto-Einstellungen */}
        <div className="lg:col-span-2">
          <AccountSettings currentEmail={session.user.email ?? ""} />
        </div>

        {/* Nachrichten */}
        <div className="card-elevated p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <MessageSquareText className="h-4.5 w-4.5 text-accent" />
            Nachrichten
          </h2>
          {nachrichten.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Keine Nachrichten — sobald unser Team Ihnen schreibt, erscheint es hier.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {nachrichten.map((n) => (
                <li
                  key={n.id}
                  className={`max-w-2xl rounded-xl border p-4 ${
                    n.sender === "team"
                      ? "border-accent/20 bg-accent/[0.04]"
                      : "ml-auto border-edge bg-card"
                  }`}
                >
                  <p className="text-xs font-semibold text-ink-muted">
                    {n.sender === "team" ? "NOREVAN Team" : "Sie"} · {formatDate(n.created_at)}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink">{n.content}</p>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendReply();
            }}
            className="mt-4 flex items-center gap-2"
          >
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={5000}
              placeholder="Antwort an das Team …"
              className="field flex-1"
            />
            <button
              type="submit"
              disabled={replySending || !reply.trim()}
              aria-label="Antwort senden"
              className="btn-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
            >
              {replySending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>

      {report && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setReport(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="print-section my-8 w-full max-w-2xl rounded-2xl border border-edge bg-surface p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink">Ihr Analyse-Report</h3>
                <p className="text-xs break-all text-ink-muted">
                  {report.website} · {formatDate(report.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold"
                >
                  <FileDown className="h-4 w-4" />
                  Als PDF
                </button>
                <button
                  type="button"
                  onClick={() => setReport(null)}
                  aria-label="Schließen"
                  className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <ReportDetail result={report.result} />
          </div>
        </div>
      )}
    </section>
  );
}
