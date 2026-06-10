import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-edge py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 md:flex-row md:justify-between md:px-8">
        <a href="#top" className="flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan-glow">
            <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-bold tracking-tight">
            NOREVAN<span className="text-accent-soft"> Digital</span>
          </span>
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-slate-400">
          <a href="#warum-wir" className="transition-colors hover:text-white">Warum wir</a>
          <a href="#leistungen" className="transition-colors hover:text-white">Leistungen</a>
          <a href="#sicherheit" className="transition-colors hover:text-white">Sicherheit</a>
          <a href="#kontakt" className="transition-colors hover:text-white">Kontakt</a>
        </nav>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} NOREVAN Digital. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
