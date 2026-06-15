"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, Loader2, Send, User } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

interface Conv {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  budget: string | null;
  status: string | null;
  ai_active: boolean;
  updated_at: string;
}
interface Msg {
  id: string;
  sender: "visitor" | "ai" | "admin";
  content: string;
  created_at: string;
}

function when(iso: string) {
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function LiveChats() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    const { data } = await getSupabase()
      .from("agency_conversations")
      .select("id,name,email,phone,website,budget,status,ai_active,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    setConvs((data ?? []) as Conv[]);
    setLoading(false);
  }, []);

  const loadMsgs = useCallback(async (id: string) => {
    const { data } = await getSupabase()
      .from("agency_chat_messages")
      .select("id,sender,content,created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    setMsgs((data ?? []) as Msg[]);
  }, []);

  useEffect(() => {
    const t = setTimeout(loadConvs, 0);
    return () => clearTimeout(t);
  }, [loadConvs]);

  useEffect(() => {
    if (!active) return;
    const id = active.id;
    const first = setTimeout(() => loadMsgs(id), 0);
    const poll = setInterval(() => loadMsgs(id), 8000);
    return () => {
      clearTimeout(first);
      clearInterval(poll);
    };
  }, [active, loadMsgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const content = reply.trim();
    if (!content || !active || busy) return;
    setBusy(true);
    const sb = getSupabase();
    await sb.from("agency_chat_messages").insert({ conversation_id: active.id, sender: "admin", content });
    if (active.ai_active) {
      await sb.from("agency_conversations").update({ ai_active: false, status: "in Bearbeitung" }).eq("id", active.id);
      setActive({ ...active, ai_active: false });
    }
    setReply("");
    await loadMsgs(active.id);
    setBusy(false);
    loadConvs();
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (convs.length === 0) {
    return <p className="card-elevated p-6 text-sm text-ink-soft">Noch keine Anfrage-Chats. Sobald jemand über /anfrage schreibt, erscheint er hier.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className={`card-elevated max-h-[70vh] overflow-y-auto p-2 ${active ? "hidden lg:block" : ""}`}>
        {convs.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c)}
            className={`block w-full rounded-xl p-3 text-left transition-colors ${
              active?.id === c.id ? "bg-accent/10" : "hover:bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-ink">{c.name || c.email}</span>
              {c.ai_active && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Bot className="h-3 w-3" /> KI
                </span>
              )}
            </div>
            <p className="truncate text-xs text-ink-muted">{c.website || c.email} · {when(c.updated_at)}</p>
          </button>
        ))}
      </div>

      {/* Thread */}
      {active ? (
        <div className="card-elevated flex h-[70vh] flex-col overflow-hidden">
          <div className="flex items-start gap-3 border-b border-edge p-4">
            <button type="button" onClick={() => setActive(null)} aria-label="Zurück" className="rounded-lg p-1.5 text-ink-muted hover:text-ink lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{active.name || active.email}</p>
              <p className="truncate text-xs text-ink-muted">
                <a href={`mailto:${active.email}`} className="text-accent hover:underline">{active.email}</a>
                {active.phone ? ` · ${active.phone}` : ""}
                {active.website ? ` · ${active.website}` : ""}
                {active.budget ? ` · Budget: ${active.budget}` : ""}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${active.ai_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-accent/10 text-accent"}`}>
              {active.ai_active ? "KI aktiv" : "Du übernimmst"}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.sender === "admin"
                      ? "rounded-br-md bg-accent text-white"
                      : m.sender === "ai"
                        ? "rounded-bl-md bg-card text-ink ring-1 ring-edge"
                        : "rounded-bl-md bg-surface text-ink ring-1 ring-edge"
                  }`}
                >
                  <span className={`mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase ${m.sender === "admin" ? "text-white/80" : "text-ink-muted"}`}>
                    {m.sender === "visitor" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    {m.sender === "visitor" ? "Interessent" : m.sender === "ai" ? "KI" : "Du"}
                  </span>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-edge p-3"
          >
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={4000}
              placeholder="Antwort als Team (stoppt die KI) …"
              className="field flex-1"
            />
            <button type="submit" disabled={busy || !reply.trim()} aria-label="Senden" className="btn-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden items-center justify-center rounded-2xl border border-dashed border-edge p-8 text-sm text-ink-muted lg:flex">
          Wähle links eine Anfrage aus.
        </div>
      )}
    </div>
  );
}
