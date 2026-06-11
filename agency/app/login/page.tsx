"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    if (error) {
      setLoading(false);
      setError(
        /confirm/i.test(error.message)
          ? "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse (Link in Ihrem Postfach)."
          : "E-Mail oder Passwort ist falsch.",
      );
      return;
    }
    // Admins land directly in the team dashboard, customers in theirs.
    const { data: adm } = await supabase.from("agency_admins").select("email").limit(1);
    router.push(adm && adm.length > 0 ? "/admin" : "/dashboard");
  }

  return (
    <section className="relative flex min-h-[80dvh] items-center justify-center overflow-hidden px-5 pt-24 pb-16">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="card-elevated p-7 sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Willkommen zurück</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Melden Sie sich an, um Ihre Analysen und Projekte zu sehen.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
                E-Mail
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="max@firma.de"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-ink">
                Passwort
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="field"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
              Einloggen
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Noch kein Konto?{" "}
            <Link href="/registrieren" className="font-semibold text-accent hover:underline">
              Jetzt kostenlos registrieren
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
