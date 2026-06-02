"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

export function BackInStockForm({ slug, locale }: { slug: string; locale: Locale }) {
  const isDe = locale === "de";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");

  async function submit() {
    if (state === "busy" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("err");
      return;
    }
    setState("busy");
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: email.trim() }),
      });
      setState(res.ok ? "done" : "err");
    } catch {
      setState("err");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        {isDe ? "Wir benachrichtigen dich ✓" : "We'll let you know ✓"}
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {isDe ? "Benachrichtige mich, wenn wieder da" : "Notify me when back"}
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "err") setState("idle"); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="you@example.com"
          className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={state === "busy"}
          className="h-11 rounded-full border border-foreground px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          {state === "busy" ? "…" : isDe ? "Eintragen" : "Notify"}
        </button>
      </div>
      {state === "err" && (
        <p className="mt-1 font-mono text-[10px] text-red-400">
          {isDe ? "Bitte gültige E-Mail." : "Please enter a valid email."}
        </p>
      )}
    </div>
  );
}
