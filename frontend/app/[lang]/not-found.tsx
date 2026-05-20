import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-6 text-center md:px-10">
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
        404 · Not Found
      </span>
      <h1
        className="headline-italic mt-6"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        Diese Seite existiert nicht.
      </h1>
      <p className="body-soft mt-6 max-w-md text-base leading-[1.65]">
        Vielleicht wurde sie verschoben, oder du bist einem alten Link gefolgt.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/de"
          className="inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
        >
          Zur Startseite <span aria-hidden>→</span>
        </Link>
        <Link
          href="/de/shop"
          className="inline-flex items-center gap-3 rounded-full border border-foreground px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Shop ansehen
        </Link>
      </div>
    </div>
  );
}
