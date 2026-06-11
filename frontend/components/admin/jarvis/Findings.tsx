"use client";

import { useState } from "react";

// Renders JARVIS's proactive findings with a one-click "→ Aufgabe" action that
// drops the finding into the task manager. Owner-only routes enforce auth.

type Finding = { level: "warn" | "info" | "ok"; text: string };

const STYLE: Record<string, string> = {
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};
const ICON: Record<string, string> = { warn: "⚠", info: "ℹ", ok: "✓" };

export function Findings({ findings }: { findings: Finding[] }) {
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState<number | null>(null);

  async function makeTask(i: number, text: string) {
    setBusy(i);
    try {
      await fetch("/api/admin/jarvis/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text }),
      });
      setAdded((a) => ({ ...a, [i]: true }));
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="space-y-2">
      {findings.map((f, i) => (
        <li key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${STYLE[f.level]}`}>
          <span aria-hidden>{ICON[f.level]}</span>
          <span className="min-w-0 flex-1">{f.text}</span>
          {f.level !== "ok" &&
            (added[i] ? (
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-emerald-400">✓ Aufgabe</span>
            ) : (
              <button
                type="button"
                onClick={() => makeTask(i, f.text)}
                disabled={busy === i}
                className="shrink-0 rounded-full border border-cyan-500/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-cyan-300 transition-colors hover:bg-cyan-500/10 disabled:opacity-50"
              >
                {busy === i ? "…" : "→ Aufgabe"}
              </button>
            ))}
        </li>
      ))}
    </ul>
  );
}
