import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

const NAV: { de: string; en: string; href: string }[] = [
  { de: "Impressum", en: "Imprint", href: "impressum" },
  { de: "AGB", en: "Terms", href: "agb" },
  { de: "Datenschutz", en: "Privacy", href: "datenschutz" },
  { de: "Widerruf", en: "Withdrawal", href: "widerruf" },
];

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            {lang === "de" ? "Rechtliches" : "Legal"}
          </span>
          <nav className="mt-4 flex flex-row flex-wrap gap-x-5 gap-y-2 lg:flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={`/${lang}/legal/${n.href}`}
                className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
              >
                {lang === "de" ? n.de : n.en}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="prose-norevan max-w-none">{children}</article>
      </div>
    </div>
  );
}
