import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

const YEAR = 2026;

// Official brand profiles. Also mirrored in lib/seo.tsx (organizationLd sameAs).
const SOCIALS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/noreavanshop",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@norevanshop",
    icon: (
      <path d="M16 3c.3 2.3 1.8 4 4 4.2v2.7c-1.4 0-2.8-.4-4-1.1v5.7a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.8a2.6 2.6 0 1 0 1.8 2.5V3H16z" />
    ),
  },
];

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

        {/* Social links */}
        <div className="mb-8 flex items-center justify-center gap-4 border-t border-border-subtle pt-8 md:justify-start">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label={s.name}
              className="text-foreground/60 transition-colors hover:text-foreground"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {s.icon}
              </svg>
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:flex-row">
          <span>© {YEAR} Norevan UG. {dict.footer.rights}</span>
          <span>{dict.footer.builtWith}</span>
        </div>
      </div>
    </footer>
  );
}
