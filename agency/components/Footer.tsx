import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 md:flex-row md:justify-between md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan-glow">
            <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-bold tracking-tight text-ink">
            NOREVAN<span className="text-accent"> Digital</span>
          </span>
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-soft">
          <a href="#warum-wir" className="transition-colors hover:text-ink">Vorteile</a>
          <a href="#leistungen" className="transition-colors hover:text-ink">Leistungen</a>
          <a href="#portfolio" className="transition-colors hover:text-ink">Portfolio</a>
          <a href="#kontakt" className="transition-colors hover:text-ink">Kontakt</a>
        </nav>

        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} NOREVAN Digital. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
