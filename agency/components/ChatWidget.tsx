"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Loader2, MessageCircle, ScanSearch, Send, X } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hallo 👋 Schön, dass Sie da sind!\nIch bin der KI-Berater von NOREVAN Digital. Fragen Sie mich alles zu Ihrer Website — oder lassen Sie sie in 30 Sekunden kostenlos analysieren.",
};

const QUICK_REPLIES = [
  "Verliert meine Website Kunden?",
  "Was kostet eine neue Website?",
  "Wie läuft die Zusammenarbeit ab?",
];

/** Render /analyse, /kontakt etc. in replies as real links. */
function ReplyText({ text }: { text: string }) {
  const parts = text.split(/(\/(?:analyse|kontakt|leistungen|portfolio|ueber-uns))/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("/") ? (
          <Link key={i} href={part} className="font-semibold text-accent underline underline-offset-2">
            {part}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [fieldFocused, setFieldFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Hide the floating button while the user is typing in any form field, so it
  // never covers a submit/send button or the on-screen keyboard. State is only
  // set from event callbacks (not the effect body) to satisfy lint rules.
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
    const onFocusIn = (e: FocusEvent) => {
      if (isField(e.target)) setFieldFocused(true);
    };
    const onFocusOut = () => setFieldFocused(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Show the launcher unless a page form field is focused (keep it when the
  // chat itself is open — its own field shouldn't hide the close button).
  const showFab = open || !fieldFocused;

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "Entschuldigung, da ist etwas schiefgelaufen. Versuchen Sie es bitte erneut.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Verbindungsfehler — bitte versuchen Sie es erneut." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            dir="ltr"
            className="fixed right-4 bottom-24 z-50 flex max-h-[calc(100dvh-8rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-edge bg-surface text-left shadow-2xl sm:right-6"
            role="dialog"
            aria-label="KI-Assistent"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-edge bg-gradient-to-r from-accent to-cyan-glow px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">Norevan KI-Assistent</p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/85">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Online — antwortet sofort
                </p>
              </div>
              <button
                type="button"
                aria-label="Chat schließen"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-card text-ink ring-1 ring-edge"
                    }`}
                  >
                    {m.role === "assistant" ? <ReplyText text={m.content} /> : m.content}
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
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-full border border-edge bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {q}
                    </button>
                  ))}
                  <Link
                    href="/analyse"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
                  >
                    <ScanSearch className="h-3.5 w-3.5" />
                    Kostenlose Analyse starten
                  </Link>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-edge p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ihre Frage …"
                maxLength={2000}
                aria-label="Nachricht an den KI-Assistenten"
                className="field !rounded-full !py-2.5"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Senden"
                className="btn-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        type="button"
        aria-label={open ? "KI-Assistent schließen" : "KI-Assistent öffnen"}
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: showFab ? 1 : 0, scale: showFab ? 1 : 0.5 }}
        transition={{ delay: showFab ? 0.1 : 0, type: "spring", stiffness: 260, damping: 20 }}
        style={{ pointerEvents: showFab ? "auto" : "none" }}
        aria-hidden={!showFab}
        tabIndex={showFab ? 0 : -1}
        className="chat-launcher btn-primary fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full sm:right-6 sm:bottom-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
          </span>
        )}
      </motion.button>
    </>
  );
}
