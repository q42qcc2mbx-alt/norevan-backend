import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

const YEAR = 2026;

export function Footer({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const isDe = locale === "de";

  const navColumns = [
    {
      heading: isDe ? "Shop" : "Shop",
      links: [
        { label: isDe ? "Alle Produkte" : "All products", href: `/${locale}/shop` },
        { label: isDe ? "Sneaker" : "Sneakers", href: `/${locale}/shop?cat=sneaker` },
        { label: isDe ? "Streetwear" : "Streetwear", href: `/${locale}/shop?cat=streetwear` },
        { label: isDe ? "Hosen & Jeans" : "Pants & jeans", href: `/${locale}/shop?cat=hosen-jeans` },
        { label: isDe ? "Schmuck" : "Jewelry", href: `/${locale}/shop?cat=schmuck` },
      ],
    },
    {
      heading: isDe ? "Atelier" : "Atelier",
      links: [
        { label: "Lookbook", href: `/${locale}/lookbook` },
        { label: isDe ? "Marken" : "Brands", href: `/${locale}/shop` },
        { label: isDe ? "Kontakt" : "Contact", href: "mailto:hello@norevan.shop" },
      ],
    },
    {
      heading: isDe ? "Konto" : "Account",
      links: [
        { label: isDe ? "Mein Konto" : "My account", href: `/${locale}/account` },
        { label: isDe ? "Anmelden" : "Sign in", href: `/${locale}/login` },
        { label: isDe ? "Warenkorb" : "Cart", href: `/${locale}/cart` },
        { label: isDe ? "Wunschliste" : "Wishlist", href: `/${locale}/wishlist` },
      ],
    },
    {
      heading: isDe ? "Rechtliches" : "Legal",
      links: [
        { label: "Impressum", href: `/${locale}/legal/impressum` },
        { label: isDe ? "AGB" : "Terms", href: `/${locale}/legal/agb` },
        { label: isDe ? "Datenschutz" : "Privacy", href: `/${locale}/legal/datenschutz` },
        { label: isDe ? "Widerruf" : "Withdrawal", href: `/${locale}/legal/widerruf` },
      ],
    },
  ];

  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        {/* Brand wordmark — large italic Norevan with gold-e */}
        <div className="mb-14 flex items-end justify-between gap-6 border-b border-border-subtle pb-12">
          <Link
            href={`/${locale}`}
            className="font-serif tracking-tight"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              lineHeight: 0.9,
            }}
          >
            Nor<em className="not-italic" style={{ color: "var(--gold)" }}>e</em>van
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted md:block">
            {isDe ? "Berlin · seit 2026" : "Berlin · est. 2026"}
          </span>
        </div>

        {/* Nav columns */}
        <nav
          aria-label={isDe ? "Footer-Navigation" : "Footer navigation"}
          className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {navColumns.map((col) => (
            <div key={col.heading}>
              <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">
                {col.heading}
              </span>
              <ul className="flex flex-col gap-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:flex-row">
          <span>© {YEAR} Norevan UG. {dict.footer.rights}</span>
          <span>{dict.footer.builtWith}</span>
        </div>
      </div>
    </footer>
  );
}
