"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  Bot,
  FolderKanban,
  Home,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareHeart,
  MessageSquareText,
  Plus,
  ScanSearch,
  Send,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { getSupabase, PROJECT_STEPS, type ProjectStatus } from "@/lib/supabase";
import DashboardOverview from "@/components/admin/DashboardOverview";
import AdminAssistant from "@/components/admin/AdminAssistant";

interface AnalyseRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  website: string;
  goal: string | null;
  score: number | null;
  status: string;
}

interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  website: string | null;
  message: string | null;
  source: string;
}

interface FeedbackRow {
  id: string;
  created_at: string;
  typ: string;
  rating: number | null;
  email: string | null;
  message: string;
  done: boolean;
}

interface ProjectRow {
  id: string;
  created_at: string;
  email: string;
  title: string;
  status: ProjectStatus;
  notes: string | null;
}

type Tab = "uebersicht" | "assistent" | "analysen" | "anfragen" | "projekte" | "nachricht" | "feedback" | "team";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [analysen, setAnalysen] = useState<AnalyseRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [projekte, setProjekte] = useState<ProjectRow[]>([]);
  const [newProject, setNewProject] = useState({ email: "", title: "" });
  const [message, setMessage] = useState({ email: "", content: "" });
  const [feedback, setFeedback] = useState("");
  const [admins, setAdmins] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [newAdmin, setNewAdmin] = useState("");
  const [projCreated, setProjCreated] = useState<Record<string, boolean>>({});
  const [projBusy, setProjBusy] = useState<string | null>(null);
  const [myEmail, setMyEmail] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabase();
    const [a, l, p, adm, fb] = await Promise.all([
      supabase.from("agency_analyses").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("agency_leads").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("agency_projects").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("agency_admins").select("email").order("email"),
      supabase.from("agency_feedback").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setAnalysen((a.data ?? []) as AnalyseRow[]);
    setLeads((l.data ?? []) as LeadRow[]);
    setProjekte((p.data ?? []) as ProjectRow[]);
    setAdmins(((adm.data ?? []) as { email: string }[]).map((r) => r.email));
    setFeedbacks((fb.data ?? []) as FeedbackRow[]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await getSupabase().auth.getSession();
      const session: Session | null = data.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      const { data: adm } = await getSupabase().from("agency_admins").select("email").limit(1);
      if (!adm || adm.length === 0) {
        setChecking(false);
        setAllowed(false);
        return;
      }
      setMyEmail(session.user.email ?? "");
      setAllowed(true);
      await load();
      setChecking(false);
    })();
  }, [router, load]);

  async function updateProjectStatus(id: string, status: ProjectStatus) {
    await getSupabase()
      .from("agency_projects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    load();
  }

  async function projectFromAnalyse(a: AnalyseRow) {
    setProjBusy(a.id);
    try {
      const { error } = await getSupabase().from("agency_projects").insert({
        email: a.email.trim().toLowerCase(),
        title: `Website-Optimierung ${a.website}`.slice(0, 200),
        notes: a.goal ? `Ziel des Kunden: ${a.goal}` : null,
      });
      if (!error) {
        setProjCreated((m) => ({ ...m, [a.id]: true }));
        load();
      }
    } finally {
      setProjBusy(null);
    }
  }

  async function createProject(e: FormEvent) {
    e.preventDefault();
    setFeedback("");
    const { error } = await getSupabase().from("agency_projects").insert({
      email: newProject.email.trim().toLowerCase(),
      title: newProject.title.trim(),
    });
    setFeedback(error ? "Projekt konnte nicht angelegt werden." : "Projekt angelegt ✓");
    if (!error) {
      setNewProject({ email: "", title: "" });
      load();
    }
  }

  async function addAdmin(e: FormEvent) {
    e.preventDefault();
    setFeedback("");
    const email = newAdmin.trim().toLowerCase();
    const { error } = await getSupabase().from("agency_admins").insert({ email });
    setFeedback(
      error
        ? "Admin konnte nicht hinzugefügt werden (existiert evtl. bereits)."
        : "Admin hinzugefügt ✓",
    );
    if (!error) {
      setNewAdmin("");
      load();
    }
  }

  async function removeAdmin(email: string) {
    setFeedback("");
    const { error } = await getSupabase().from("agency_admins").delete().eq("email", email);
    setFeedback(error ? "Entfernen fehlgeschlagen." : "Admin entfernt ✓");
    if (!error) load();
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    setFeedback("");
    const { error } = await getSupabase().from("agency_messages").insert({
      email: message.email.trim().toLowerCase(),
      sender: "team",
      content: message.content.trim(),
    });
    setFeedback(error ? "Nachricht konnte nicht gesendet werden." : "Nachricht gesendet ✓");
    if (!error) setMessage({ email: "", content: "" });
  }

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  if (checking) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-5 pt-20 text-center">
        <ShieldCheck className="mb-4 h-12 w-12 text-ink-muted" />
        <h1 className="text-xl font-bold text-ink">Kein Zugriff</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Dieser Bereich ist dem NOREVAN-Team vorbehalten.
        </p>
        <Link href="/dashboard" className="btn-secondary mt-6 rounded-full px-6 py-2.5 text-sm font-semibold">
          Zu meinem Dashboard
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Inbox }[] = [
    { key: "uebersicht", label: "Übersicht", icon: LayoutDashboard },
    { key: "assistent", label: "KI-Assistent", icon: Bot },
    { key: "analysen", label: `Analysen (${analysen.length})`, icon: ScanSearch },
    { key: "anfragen", label: `Anfragen (${leads.length})`, icon: Inbox },
    { key: "projekte", label: `Projekte (${projekte.length})`, icon: FolderKanban },
    { key: "nachricht", label: "Nachricht senden", icon: MessageSquareText },
    { key: "feedback", label: `Feedback (${feedbacks.filter((f) => !f.done).length})`, icon: MessageSquareHeart },
    { key: "team", label: `Team (${admins.length})`, icon: Users },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 pt-28 pb-20 md:px-8 md:pt-32">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            <ShieldCheck className="h-7 w-7 text-accent" />
            Team-Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Alle Analysen, Anfragen und Projekte an einem Ort.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Dashboard-Navigation">
          <Link href="/" className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
            <Home className="h-4 w-4" />
            Startseite
          </Link>
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
            <LayoutDashboard className="h-4 w-4" />
            Mein Dashboard
          </Link>
          <Link href="/analyse" className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
            <ScanSearch className="h-4 w-4" />
            KI-Analyse
          </Link>
          <button
            type="button"
            onClick={logout}
            className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </nav>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setFeedback("");
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-accent text-white" : "btn-secondary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "uebersicht" && (
          <DashboardOverview
            analysen={analysen}
            leads={leads}
            projekte={projekte}
            feedbacks={feedbacks}
            admins={admins}
            onNavigate={(t) => {
              setTab(t as Tab);
              setFeedback("");
            }}
          />
        )}

        {tab === "assistent" && <AdminAssistant />}

        {tab === "analysen" && (
          <div className="card-elevated overflow-x-auto p-2 sm:p-4">
            {analysen.length === 0 ? (
              <p className="p-4 text-sm text-ink-soft">Noch keine Analysen eingegangen.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-edge text-xs tracking-wide text-ink-muted uppercase">
                    <th className="px-3 py-2.5">Datum</th>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">E-Mail</th>
                    <th className="px-3 py-2.5">Website</th>
                    <th className="px-3 py-2.5">Score</th>
                    <th className="px-3 py-2.5">Ziel / Wünsche</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {analysen.map((a) => (
                    <tr key={a.id} className="border-b border-edge/60 align-top last:border-0">
                      <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{formatDate(a.created_at)}</td>
                      <td className="px-3 py-3 font-medium text-ink">{a.name}</td>
                      <td className="px-3 py-3">
                        <a href={`mailto:${a.email}`} className="text-accent hover:underline">
                          {a.email}
                        </a>
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-3 text-ink-soft">{a.website}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-bold text-white ${
                            (a.score ?? 0) >= 80 ? "bg-emerald-500" : (a.score ?? 0) >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                        >
                          {a.score ?? "–"}
                        </span>
                      </td>
                      <td className="max-w-[220px] px-3 py-3 text-ink-soft">{a.goal || "—"}</td>
                      <td className="px-3 py-3">
                        {projCreated[a.id] ? (
                          <span className="text-[11px] font-bold tracking-wide text-emerald-500 uppercase">✓ Projekt</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => projectFromAnalyse(a)}
                            disabled={projBusy === a.id}
                            className="rounded-full border border-accent/40 px-2.5 py-1 text-[11px] font-bold tracking-wide text-accent uppercase transition-colors hover:bg-accent/10 disabled:opacity-50"
                          >
                            {projBusy === a.id ? "…" : "→ Projekt"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "anfragen" && (
          <div className="card-elevated overflow-x-auto p-2 sm:p-4">
            {leads.length === 0 ? (
              <p className="p-4 text-sm text-ink-soft">Noch keine Anfragen eingegangen.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-edge text-xs tracking-wide text-ink-muted uppercase">
                    <th className="px-3 py-2.5">Datum</th>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">E-Mail</th>
                    <th className="px-3 py-2.5">Quelle</th>
                    <th className="px-3 py-2.5">Nachricht</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-edge/60 align-top last:border-0">
                      <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{formatDate(l.created_at)}</td>
                      <td className="px-3 py-3 font-medium text-ink">{l.name}</td>
                      <td className="px-3 py-3">
                        <a href={`mailto:${l.email}`} className="text-accent hover:underline">
                          {l.email}
                        </a>
                      </td>
                      <td className="px-3 py-3 text-ink-muted capitalize">{l.source}</td>
                      <td className="max-w-[280px] px-3 py-3 text-ink-soft">{l.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "projekte" && (
          <div className="space-y-5">
            <form onSubmit={createProject} className="card-elevated flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="np-email" className="mb-1.5 block text-sm font-medium text-ink">
                  Kunden-E-Mail
                </label>
                <input
                  id="np-email"
                  type="email"
                  required
                  value={newProject.email}
                  onChange={(e) => setNewProject((f) => ({ ...f, email: e.target.value }))}
                  placeholder="kunde@firma.de"
                  className="field"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="np-title" className="mb-1.5 block text-sm font-medium text-ink">
                  Projekttitel
                </label>
                <input
                  id="np-title"
                  type="text"
                  required
                  maxLength={200}
                  value={newProject.title}
                  onChange={(e) => setNewProject((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Website Relaunch firma.de"
                  className="field"
                />
              </div>
              <button
                type="submit"
                className="btn-primary inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Anlegen
              </button>
            </form>

            {projekte.map((p) => (
              <div key={p.id} className="card-elevated flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{p.title}</p>
                  <p className="text-xs text-ink-muted">
                    {p.email} · angelegt {formatDate(p.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`status-${p.id}`} className="text-xs font-medium text-ink-muted">
                    Status:
                  </label>
                  <select
                    id={`status-${p.id}`}
                    value={p.status}
                    onChange={(e) => updateProjectStatus(p.id, e.target.value as ProjectStatus)}
                    className="field !w-auto !py-2 text-sm capitalize"
                  >
                    {PROJECT_STEPS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {projekte.length === 0 && (
              <p className="text-sm text-ink-soft">Noch keine Projekte — legen Sie oben das erste an.</p>
            )}
          </div>
        )}

        {tab === "nachricht" && (
          <form onSubmit={sendMessage} className="card-elevated max-w-2xl space-y-4 p-6">
            <div>
              <label htmlFor="msg-email" className="mb-1.5 block text-sm font-medium text-ink">
                Empfänger (Kunden-E-Mail)
              </label>
              <input
                id="msg-email"
                type="email"
                required
                value={message.email}
                onChange={(e) => setMessage((f) => ({ ...f, email: e.target.value }))}
                placeholder="kunde@firma.de"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="msg-content" className="mb-1.5 block text-sm font-medium text-ink">
                Nachricht
              </label>
              <textarea
                id="msg-content"
                rows={5}
                required
                maxLength={5000}
                value={message.content}
                onChange={(e) => setMessage((f) => ({ ...f, content: e.target.value }))}
                placeholder="Update zum Projekt …"
                className="field resize-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <Send className="h-4 w-4" />
              Senden
            </button>
            <p className="text-xs text-ink-muted">
              Der Kunde sieht die Nachricht in seinem Dashboard (Konto mit dieser E-Mail erforderlich).
            </p>
          </form>
        )}

        {tab === "feedback" && (
          <div className="max-w-3xl space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-sm text-ink-soft">Noch kein Feedback eingegangen.</p>
            ) : (
              feedbacks.map((f) => (
                <div key={f.id} className={`card-elevated p-5 ${f.done ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent capitalize">
                      {f.typ}
                    </span>
                    {f.rating != null && (
                      <span className="text-xs font-semibold text-amber-500">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                    )}
                    <span className="text-xs text-ink-muted">{formatDate(f.created_at)}</span>
                    {f.email && (
                      <a href={`mailto:${f.email}`} className="text-xs text-accent hover:underline">
                        {f.email}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        await getSupabase().from("agency_feedback").update({ done: !f.done }).eq("id", f.id);
                        load();
                      }}
                      className="ms-auto rounded-full border border-edge px-3 py-1 text-[11px] font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {f.done ? "Wieder öffnen" : "Erledigt ✓"}
                    </button>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-line text-ink">{f.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "team" && (
          <div className="max-w-2xl space-y-5">
            <div className="card-elevated p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <Users className="h-4.5 w-4.5 text-accent" />
                Team-Admins
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Alle Admins sind gleichberechtigt — es gibt keinen Owner. Jeder
                Admin kann Analysen, Anfragen und Projekte verwalten.
              </p>
              <ul className="mt-4 space-y-2.5">
                {admins.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate text-sm font-medium text-ink">{email}</span>
                      {email.toLowerCase() === myEmail.toLowerCase() && (
                        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          Sie
                        </span>
                      )}
                    </div>
                    {email.toLowerCase() !== myEmail.toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => removeAdmin(email)}
                        aria-label={`${email} als Admin entfernen`}
                        className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={addAdmin} className="card-elevated flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="adm-email" className="mb-1.5 block text-sm font-medium text-ink">
                  Neuen Admin hinzufügen (E-Mail)
                </label>
                <input
                  id="adm-email"
                  type="email"
                  required
                  value={newAdmin}
                  onChange={(e) => setNewAdmin(e.target.value)}
                  placeholder="teammitglied@norevan.digital"
                  className="field"
                />
              </div>
              <button
                type="submit"
                className="btn-primary inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Hinzufügen
              </button>
            </form>
            <p className="text-xs text-ink-muted">
              Hinweis: Das eigene Konto kann nicht entfernt werden, damit das
              Team sich nicht aussperrt. Der Admin-Zugang gilt für das Konto
              mit genau dieser E-Mail-Adresse.
            </p>
          </div>
        )}

        {feedback && <p className="mt-4 text-sm font-medium text-accent">{feedback}</p>}
      </div>
    </section>
  );
}
