"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Loader2, RotateCcw, Send, ShieldCheck } from "lucide-react";
import Aurora from "@/components/ui/Aurora";

const TOKEN_KEY = "norevan_inquiry_token";
const EMPTY = { name: "", email: "", phone: "", website: "", budget: "", message: "", company: "" };

interface Msg {
  sender: "visitor" | "ai" | "admin";
  content: string;
  created_at: string;
}

const BUDGETS = ["unter 1.000 €", "1.000–3.000 €", "3.000–10.000 €", "über 10.000 €", "noch unklar"];

export default function AnfragePage() {
  const [phase, setPhase] = useState<"form" | "chat">("form");
  const [form, setForm] = useState({ ...EMPTY });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        if (t) {
          setToken(t);
          setPhase("chat");
        }
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "chat" || !token) return;
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/inquiry/chat?token=${encodeURIComponent(token)}`);
        const d = await res.json();
        if (active && Array.isArray(d.messages)) setMessages(d.messages);
      } catch {
        /* ignore */
      }
    };
    const first = setTimeout(load, 0);
    const id = setInterval(load, 6000);
    return () => {
      active = false;
      clearTimeout(first);
      clearInterval(id);
    };
  }, [phase, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submitForm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Das hat nicht geklappt.");
      try {
        localStorage.setItem(TOKEN_KEY, d.token);
      } catch {
        /* ignore */
      }
      setToken(d.token);
      setMessages(d.messages ?? []);
      setPhase("chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setSending(false);
    }
  }

  async function sendMsg() {
    const content = input.trim();
    if (!content || chatSending || !token) return;
    setInput("");
    setChatSending(true);
    setMessages((m) => [...m, { sender: "visitor", content, created_at: new Date().toISOString() }]);
    try {
      const res = await fetch("/api/inquiry/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, content }),
      });
      const d = await res.json();
      if (Array.isArray(d.messages)) setMessages(d.messages);
    } catch {
      /* ignore */
    } finally {
      setChatSending(false);
    }
  }

  function reset() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setMessages([]);
    setForm({ ...EMPTY });
    setError(null);
    setPhase("form");
  }

  return (
    <section dir="ltr" className="relative min-h-[80svh] overflow-hidden px-5 pt-24 pb-16 text-left md:pt-32">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <Aurora />
      <div className="relative mx-auto w-full max-w-2xl">
        {phase === "form" ? (
          <>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-ink sm:text-3xl md:text-4xl">
                Projekt-Anfrage senden
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
                Erzählen Sie uns kurz von Ihrem Vorhaben. Unser KI-Berater antwortet sofort — ein
                Mensch aus dem Team meldet sich persönlich.
              </p>
            </div>

            <form onSubmit={submitForm} className="card-elevated mt-8 space-y-4 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Name *" value={form.name} onChange={set("name")} placeholder="Max Mustermann" required />
                <Field id="email" label="E-Mail *" type="email" value={form.email} onChange={set("email")} placeholder="max@firma.de" required />
                <Field id="phone" label="Telefon" value={form.phone} onChange={set("phone")} placeholder="+49 …" />
                <Field id="website" label="Ihre Website" value={form.website} onChange={set("website")} placeholder="https://ihre-firma.de" />
              </div>
              <div>
                <label htmlFor="budget" className="mb-1.5 block text-sm font-medium text-ink">Budget (grob)</label>
                <select id="budget" value={form.budget} onChange={set("budget")} className="field">
                  <option value="">Bitte wählen …</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">Worum geht es? *</label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  maxLength={4000}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="z. B. Meine Website ist langsam und ich bekomme zu wenige Anfragen …"
                  className="field resize-none"
                />
              </div>
              {/* Honeypot */}
              <input type="text" name="company" value={form.company} onChange={set("company")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

              <button
                type="submit"
                disabled={sending}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold disabled:opacity-70"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Anfrage senden & Chat starten
              </button>
              {error && <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> SSL-verschlüsselt · DSGVO-konform · Server in der EU
              </p>
            </form>
          </>
        ) : (
          <div className="card-elevated flex h-[70vh] max-h-[640px] min-h-[440px] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-edge bg-gradient-to-r from-accent to-cyan-glow px-5 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">Ihre Anfrage bei NOREVAN Digital</p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/85">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  KI antwortet sofort — ein Mensch meldet sich
                </p>
              </div>
              <button type="button" onClick={reset} aria-label="Neue Anfrage" className="rounded-lg p-1.5 text-white/85 transition-colors hover:bg-white/15 hover:text-white">
                <RotateCcw className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      m.sender === "visitor"
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-card text-ink ring-1 ring-edge"
                    }`}
                  >
                    {m.sender !== "visitor" && (
                      <span className="mb-0.5 block text-[10px] font-bold tracking-wide text-ink-muted uppercase">
                        {m.sender === "admin" ? "NOREVAN Team" : "KI-Assistent"}
                      </span>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              {chatSending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 ring-1 ring-edge">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMsg();
              }}
              className="flex items-center gap-2 border-t border-edge p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
                placeholder="Ihre Nachricht …"
                className="field flex-1"
              />
              <button
                type="submit"
                disabled={chatSending || !input.trim()}
                aria-label="Senden"
                className="btn-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={300}
        className="field"
      />
    </div>
  );
}
