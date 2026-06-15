import Link from "next/link";
import { Home, ScanSearch } from "lucide-react";
import Aurora from "@/components/ui/Aurora";

export const metadata = { title: "Seite nicht gefunden" };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[72dvh] items-center justify-center overflow-hidden px-5 pt-24 pb-16">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="grid-overlay absolute inset-0" aria-hidden />
      <Aurora />
      <div className="relative text-center">
        <p className="text-gradient font-display text-7xl font-bold md:text-8xl">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Diese Seite gibt es nicht (mehr).
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
          Vielleicht hilft einer dieser Wege weiter — oder lassen Sie gleich Ihre Website kostenlos
          analysieren.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
          >
            <Home className="h-5 w-5" />
            Zur Startseite
          </Link>
          <Link
            href="/analyse"
            className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
          >
            <ScanSearch className="h-5 w-5" />
            Kostenlose Analyse
          </Link>
        </div>
      </div>
    </section>
  );
}
