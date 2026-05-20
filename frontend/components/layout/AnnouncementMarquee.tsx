import type { Locale } from "@/lib/i18n/config";

const MESSAGES: Record<Locale, string[]> = {
  de: [
    "Versandkostenfrei ab 100 €",
    "Atelier-verifiziert",
    "30 Tage Rückgabe",
    "Kuratiert in Berlin",
    "Saison 2026",
    "DE / AT / CH",
  ],
  en: [
    "Free shipping over €100",
    "Atelier-verified",
    "30-day returns",
    "Curated in Berlin",
    "Season 2026",
    "DE / AT / CH",
  ],
};

const SEP = "  •  ";

export function AnnouncementMarquee({ locale }: { locale: Locale }) {
  const items = MESSAGES[locale];
  // duplicate so the loop is seamless
  const text = [...items, ...items, ...items, ...items].join(SEP);
  return (
    <section
      aria-label="announcements"
      className="relative overflow-hidden border-y border-border-subtle bg-background py-3"
    >
      <div
        className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.35em] text-muted"
        style={{ animation: "norevan-marquee 38s linear infinite" }}
      >
        {text}
      </div>
      <style>{`
        @keyframes norevan-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
