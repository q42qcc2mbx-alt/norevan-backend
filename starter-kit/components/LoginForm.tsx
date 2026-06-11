"use client";

import { useState } from "react";

// Generic email + password login. Posts to /api/auth/login (see the stub route)
// which sets a session cookie and redirects to /dashboard. Wire that route to
// your own user store (Supabase, Postgres, etc.).

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          name: form.get("name") ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Anmeldung fehlgeschlagen");
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-semibold">
        {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {mode === "login" ? "Melde dich an, um fortzufahren." : "In 30 Sekunden startklar."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        {mode === "register" && (
          <input
            name="name"
            required
            placeholder="Name"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        )}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="E-Mail"
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Passwort"
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-neutral-900 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-neutral-900 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Bitte warten…" : mode === "login" ? "Anmelden" : "Registrieren"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
        className="mt-4 w-full text-center text-sm text-neutral-500 hover:text-neutral-900"
      >
        {mode === "login" ? "Noch kein Konto? Registrieren" : "Schon registriert? Anmelden"}
      </button>
    </div>
  );
}
