"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  FolderKanban,
  Inbox,
  Loader2,
  MessageSquareText,
  Plus,
  ScanSearch,
  Send,
  ShieldCheck,
} from "lucide-react";
import { getSupabase, PROJECT_STEPS, type ProjectStatus } from "@/lib/supabase";

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

interface ProjectRow {
  id: string;
  created_at: string;
  email: string;
  title: string;
  status: ProjectStatus;
  notes: string | null;
}

type Tab = "analysen" | "anfragen" | "projekte" | "nachricht";

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
  const [tab, setTab] = useState<Tab>("analysen");
  const [analysen, setAnalysen] = useState<AnalyseRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [projekte, setProjekte] = useState<ProjectRow[]>([]);
  const [newProject, setNewProject] = useState({ email: "", title: "" });
  const [message, setMessage] = useState({ email: "", content: "" });
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabase();
    const [a, l, p] = await Promise.all([
      supabase.from("agency_analyses").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("agency_leads").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("agency_projects").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setAnalysen((a.data ?? []) as AnalyseRow[]);
    setLeads((l.data ?? []) as LeadRow[]);
    setProjekte((p.data ?? []) as ProjectRow[]);
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
    { key: "analysen", label: `Analysen (${analysen.length})`, icon: ScanSearch },
    { key: "anfragen", label: `Anfragen (${leads.length})`, icon: Inbox },
    { key: "projekte", label: `Projekte (${projekte.length})`, icon: FolderKanban },
    { key: "nachricht", label: "Nachricht senden", icon: MessageSquareText },
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
        <Link href="/dashboard" className="btn-secondary self-start rounded-full px-4 py-2 text-sm font-semibold">
          Mein Dashboard
        </Link>
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

        {feedback && <p className="mt-4 text-sm font-medium text-accent">{feedback}</p>}
      </div>
    </section>
  );
}
