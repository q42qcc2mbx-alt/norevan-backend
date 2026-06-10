"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// JARVIS OMEGA console: chat with the real AI, agent personas, and voice
// (browser SpeechRecognition + speechSynthesis — feature-detected, optional
// "Hey Jarvis" wake word).

type Msg = { role: "user" | "assistant"; content: string; agent?: string | null };

const AGENTS: { id: string; label: string; icon: string }[] = [
  { id: "jarvis", label: "Jarvis", icon: "◉" },
  { id: "team", label: "Team-Modus", icon: "⬡" },
  { id: "sales", label: "Sales", icon: "📈" },
  { id: "marketing", label: "Marketing", icon: "📣" },
  { id: "seo", label: "SEO", icon: "🔎" },
  { id: "developer", label: "Developer", icon: "⌘" },
  { id: "security", label: "Security", icon: "🛡" },
  { id: "design", label: "Design", icon: "✦" },
  { id: "support", label: "Support", icon: "💬" },
];

// Minimal typing for the (webkit) SpeechRecognition API.
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type RecognitionEvent = {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } };
};

function getRecognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition as new () => Recognition) ?? (w.webkitSpeechRecognition as new () => Recognition) ?? null;
}

function speak(text: string) {
  try {
    const clean = text.replace(/[*_#`>]/g, "").replace(/\s+/g, " ").slice(0, 600);
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "de-DE";
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("de"));
    if (voice) u.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* unsupported */
  }
}

export function JarvisChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [agent, setAgent] = useState("jarvis");
  const [busy, setBusy] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const [voiceOut, setVoiceOut] = useState(false);
  const [listening, setListening] = useState(false);
  const [wakeMode, setWakeMode] = useState(false);
  const [actions, setActions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef(false);
  const recRef = useRef<Recognition | null>(null);
  // Set after mount so SSR and first client render match (hydration-safe).
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Standard hydration guard (same pattern as ThemeToggle): flag once on mount
  // so SSR and the first client render match.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setVoiceSupported(getRecognitionCtor() !== null), []);

  useEffect(() => {
    fetch("/api/admin/jarvis/chat")
      .then((r) => r.json())
      .then((d: { messages?: Msg[]; hasKey?: boolean }) => {
        if (d.messages) setMessages(d.messages);
        setHasKey(d.hasKey !== false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || busy) return;
      setInput("");
      setActions([]);
      setMessages((m) => [...m, { role: "user", content: msg }]);
      setBusy(true);
      try {
        const res = await fetch("/api/admin/jarvis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, agent }),
        });
        const data = (await res.json()) as { reply?: string; actions?: string[]; setup?: boolean };
        const reply = data.reply ?? "Keine Antwort erhalten — bitte erneut versuchen.";
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        if (data.actions?.length) setActions(data.actions);
        if (data.setup) setHasKey(false);
        if (voiceOut) speak(reply);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: "Verbindungsfehler — bitte erneut versuchen." }]);
      } finally {
        setBusy(false);
      }
    },
    [agent, busy, voiceOut],
  );

  // Push-to-talk: one-shot recognition fills + sends.
  const pushToTalk = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || listening) return;
    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[e.results.length - 1]?.[0]?.transcript ?? "";
      if (t.trim()) void send(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }, [listening, send]);

  // "Hey Jarvis" wake word: continuous recognition, restarts itself.
  const stopWake = useCallback(() => {
    wakeRef.current = false;
    setWakeMode(false);
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
  }, []);

  const startWake = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    wakeRef.current = true;
    setWakeMode(true);
    const run = () => {
      if (!wakeRef.current) return;
      const rec = new Ctor();
      recRef.current = rec;
      rec.lang = "de-DE";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (!r.isFinal) continue;
          const said = r[0].transcript.toLowerCase();
          const idx = said.lastIndexOf("jarvis");
          if (idx === -1) continue;
          const command = r[0].transcript.slice(idx + "jarvis".length).replace(/^[,.!?\s]+/, "").trim();
          if (command.length > 2) void send(command);
          else speak("Ja? Ich höre.");
        }
      };
      rec.onend = () => {
        if (wakeRef.current) setTimeout(run, 300); // keep listening
      };
      rec.onerror = () => {
        /* onend follows and restarts */
      };
      try {
        rec.start();
      } catch {
        /* already running */
      }
    };
    run();
  }, [send]);

  useEffect(() => () => stopWake(), [stopWake]);

  return (
    <div className="jarvis-panel flex h-[640px] flex-col overflow-hidden rounded-2xl">
      {/* Agent selector */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-cyan-500/20 px-4 py-3">
        {AGENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAgent(a.id)}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
              agent === a.id
                ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                : "border-border text-muted hover:border-cyan-500/40 hover:text-foreground"
            }`}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {!hasKey && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          ⚠️ JARVIS-Gehirn nicht verbunden: Hinterlege <code className="font-mono">ANTHROPIC_API_KEY</code> in Vercel
          (Settings → Environment Variables) und deploye neu. Schlüssel: console.anthropic.com
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" data-lenis-prevent>
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="jarvis-core mx-auto mb-4 h-16 w-16 rounded-full" />
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-400/80">
                Guten Tag, Sir.
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Frag mich nach Umsatz, Strategien, Fehlern oder sag »merk dir …« / »leg eine Aufgabe an …«.
              </p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-foreground text-background"
                  : "border border-cyan-500/25 bg-cyan-950/30 text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((a, i) => (
              <span key={i} className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                {a}
              </span>
            ))}
          </div>
        )}
        {busy && (
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="jarvis-core h-4 w-4 rounded-full" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Jarvis denkt …</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-2 border-t border-cyan-500/20 px-4 py-3"
      >
        {voiceSupported && (
          <>
            <button
              type="button"
              onClick={pushToTalk}
              title="Sprechen (Push-to-talk)"
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
                listening ? "jarvis-glow border-cyan-400 text-cyan-300" : "border-border text-muted hover:text-foreground"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => (wakeMode ? stopWake() : startWake())}
              title='Wake-Word "Hey Jarvis" an/aus'
              className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors ${
                wakeMode ? "jarvis-glow border-cyan-400 text-cyan-300" : "border-border text-muted hover:text-foreground"
              }`}
            >
              {wakeMode ? "● Hey Jarvis" : "○ Hey Jarvis"}
            </button>
          </>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? "Jarvis arbeitet …" : "Befehl an Jarvis …"}
          disabled={busy}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm focus:border-cyan-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setVoiceOut((v) => !v)}
          title="Sprachausgabe an/aus"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
            voiceOut ? "border-cyan-400 text-cyan-300" : "border-border text-muted hover:text-foreground"
          }`}
        >
          {voiceOut ? "🔊" : "🔇"}
        </button>
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-11 shrink-0 rounded-full bg-cyan-400 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#06121a] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
