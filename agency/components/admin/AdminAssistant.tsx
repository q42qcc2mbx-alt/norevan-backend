"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hallo 👋 Ich bin dein interner KI-Assistent.\nIch formuliere Kundenantworten, schlage konkrete Website-Verbesserungen vor, erkläre unsere Preise & den Funnel und helfe beim Verkauf. Was brauchst du?",
};

const PROMPTS = [
  "Formuliere eine freundliche Antwort an einen neuen Lead",
  "Was kann ich an einer langsamen Website verbessern?",
  "Erkläre unsere Preise einfach",
  "Wie funktioniert unser Lead-Funnel?",
];

export default function AdminAssistant() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const d = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: d.reply ?? d.error ?? "Da ist etwas schiefgelaufen — bitte erneut versuchen." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Verbindungsfehler — bitte erneut versuchen." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="card-elevated flex h-[62vh] max-h-[640px] min-h-[420px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-edge bg-gradient-to-r from-accent to-cyan-glow px-5 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-sm font-bold text-white">Interner KI-Assistent</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/85">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Nur fürs Team — Kunden sehen das nicht
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "rounded-br-md bg-accent text-white"
                  : "rounded-bl-md bg-card text-ink ring-1 ring-edge"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 ring-1 ring-edge">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-edge bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-edge p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={4000}
          placeholder="Frag den Assistenten …"
          className="field flex-1"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Senden"
          className="btn-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
