"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import Aurora from "@/components/ui/Aurora";

// Branded runtime-error boundary — replaces Next's default error screen with
// an on-brand, reassuring page and a retry button. Keeps the visitor in the
// funnel instead of dead-ending on a stack trace.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <section
      dir="ltr"
      className="relative flex min-h-[72dvh] items-center justify-center overflow-hidden px-5 pt-24 pb-16 text-center"
    >
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="grid-overlay absolute inset-0" aria-hidden />
      <Aurora />
      <div className="relative">
        <p className="text-gradient font-display text-6xl font-bold md:text-7xl">Hoppla</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Da ist etwas schiefgelaufen.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
          Kein Grund zur Sorge — versuchen Sie es einfach erneut. Bleibt das Problem, sind wir nur
          eine Nachricht entfernt.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
          >
            <RefreshCw className="h-5 w-5" />
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
          >
            <Home className="h-5 w-5" />
            Zur Startseite
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-ink-muted">Fehler-Code: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
