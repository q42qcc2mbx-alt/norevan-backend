"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UserRoundPlus } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import Aurora from "@/components/ui/Aurora";

const perks = [
  "Alle Ihre KI-Analysen an einem Ort",
  "Projektstatus live verfolgen",
  "Direkte Nachrichten vom Team",
];

export default function RegistrierenPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (form.password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    setLoading(true);
    const { data, error } = await getSupabase().auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { name: form.name.trim() } },
    });
    setLoading(false);
    if (error) {
      setError(
        /already/i.test(error.message)
          ? "Für diese E-Mail existiert bereits ein Konto — bitte einloggen."
          : "Registrierung fehlgeschlagen. Bitte prüfen Sie Ihre Eingaben.",
      );
      return;
    }
    if (data.session) {
      router.push("/dashboard");
    } else {
      setInfo(
        "Fast geschafft! Wir haben Ihnen eine E-Mail geschickt — bitte bestätigen Sie Ihre Adresse und loggen Sie sich danach ein.",
      );
    }
  }

  return (
    <section className="relative flex min-h-[80dvh] items-center justify-center overflow-hidden px-5 pt-24 pb-16">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <Aurora />
      <div className="relative w-full max-w-md">
        <div className="card-elevated p-7 sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Konto erstellen</h1>
          <ul className="mt-4 space-y-2">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-ink-soft">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Max Mustermann"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-ink">
                E-Mail
              </label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-ink">
                Passwort <span className="font-normal text-ink-muted">(mind. 8 Zeichen)</span>
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="field"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            {info && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserRoundPlus className="h-5 w-5" />}
              Kostenlos registrieren
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Bereits ein Konto?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Einloggen
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
