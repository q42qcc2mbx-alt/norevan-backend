import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdminAuthed } from "@/lib/auth/admin";

export const metadata = {
  title: "Login — Norevan Admin",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Bitte Email und Passwort eingeben.",
  not_admin: "Dieser Account hat keine Admin-Berechtigung.",
  "Invalid login credentials": "Email oder Passwort falsch.",
};

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  if (await isAdminAuthed()) redirect("/admin");

  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error))
    : null;

  return (
    <form
      action="/api/admin/login"
      method="POST"
      className="space-y-4 rounded-md border border-border bg-card p-6 shadow-sm"
    >
      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Passwort
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
        />
      </label>

      {errorMessage && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-foreground px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
      >
        Einloggen
      </button>
    </form>
  );
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            Norevan
          </span>
          <h1
            className="mt-2 font-serif italic"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1,
            }}
          >
            admin
          </h1>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted-bg" />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Geschützter Bereich · noindex
        </p>
      </div>
    </div>
  );
}
