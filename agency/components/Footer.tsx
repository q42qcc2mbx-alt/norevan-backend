"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/site.config";
import Logo from "./ui/Logo";
import FeedbackWidget from "./FeedbackWidget";

export default function Footer() {
  const { t } = useI18n();

  const columns = [
    {
      title: t.footer.navigation,
      links: [
        { href: "/", label: t.nav.home },
        { href: "/leistungen", label: t.nav.services },
        { href: "/portfolio", label: t.nav.portfolio },
        { href: "/ueber-uns", label: t.nav.about },
      ],
    },
    {
      title: t.footer.service,
      links: [
        { href: "/analyse", label: t.footer.freeAnalysis },
        { href: "/kontakt", label: t.nav.contact },
        { href: "/login", label: t.footer.customerLogin },
        { href: "/registrieren", label: t.footer.createAccount },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: "/impressum", label: t.footer.imprint },
        { href: "/datenschutz", label: t.footer.privacy },
      ],
    },
  ];

  return (
    <footer className="border-t border-edge bg-page py-12">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Link href="/" aria-label="NOREVAN Digital — Startseite">
              <Logo size={32} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{t.footer.tagline}</p>
            <div className="mt-5">
              <FeedbackWidget trigger="button" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
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
            © {new Date().getFullYear()} NOREVAN Digital. {t.footer.rights}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs text-ink-muted transition-colors hover:text-ink"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
