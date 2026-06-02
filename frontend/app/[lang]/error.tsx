"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-6 text-center md:px-10">
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
        Etwas ist schief gelaufen
      </span>
      <h1
        className="headline-italic mt-6"
        style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
      >
        Wir richten das gerade.
      </h1>
      <p className="body-soft mt-6 max-w-md text-base leading-[1.65]">
        Ein unerwarteter Fehler ist aufgetreten. Versuche es nochmal — falls es bleibt, schreib uns.
      </p>
      {error.digest && (
        <code className="mt-4 inline-block rounded-sm bg-muted-bg px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          ref · {error.digest}
        </code>
      )}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
        >
          Nochmal versuchen
        </button>
        <Link
          href="/de"
          className="inline-flex items-center gap-3 rounded-full border border-foreground px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
