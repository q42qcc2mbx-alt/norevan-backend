import Link from "next/link";
import { Zap } from "lucide-react";

const columns = [
  {
    title: "Navigation",
    links: [
      { href: "/", label: "Startseite" },
      { href: "/leistungen", label: "Leistungen" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "/ueber-uns", label: "Über Uns" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: "/analyse", label: "Kostenlose KI-Analyse" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/login", label: "Kunden-Login" },
      { href: "/registrieren", label: "Konto erstellen" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-page py-12">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan-glow">
                <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-bold tracking-tight text-ink">
                NOREVAN<span className="text-accent"> Digital</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Wir machen Websites schnell, sicher und erfolgreich — mit
              messbaren Ergebnissen statt leerer Versprechen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="mb-3.5 text-sm font-semibold text-ink">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-edge pt-6 sm:flex-row">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} NOREVAN Digital. Alle Rechte vorbehalten.
          </p>
          <a
            href="mailto:kontakt@norevan.digital"
            className="text-xs text-ink-muted transition-colors hover:text-ink"
          >
            kontakt@norevan.digital
          </a>
        </div>
      </div>
    </footer>
  );
}
