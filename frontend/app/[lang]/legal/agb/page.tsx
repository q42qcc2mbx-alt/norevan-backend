import { Suspense } from "react";
import { locales, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "AGB — Norevan",
  description: "Allgemeine Geschäftsbedingungen.",
};

const SECTIONS = (isDe: boolean) => [
  {
    title: isDe ? "§ 1 Geltungsbereich" : "§ 1 Scope",
    body: isDe
      ? "Diese AGB gelten für alle Bestellungen über norevan.shop zwischen Norevan UG und Verbrauchern."
      : "These terms apply to all orders placed via norevan.shop between Norevan UG and consumers.",
  },
  {
    title: isDe ? "§ 2 Vertragsschluss" : "§ 2 Contract formation",
    body: isDe
      ? "Die Darstellung der Produkte stellt kein Angebot dar. Mit der Bestellung gibt der Kunde ein verbindliches Angebot ab; die Annahme erfolgt durch Bestätigungs-E-Mail."
      : "Product display does not constitute an offer. With the order, the customer makes a binding offer; acceptance occurs by confirmation email.",
  },
  {
    title: isDe ? "§ 3 Preise & Versand" : "§ 3 Prices & shipping",
    body: isDe
      ? "Alle Preise verstehen sich in EUR inkl. MwSt. Versandkosten werden im Checkout angezeigt. Versand frei ab 100 € in DE/AT/CH."
      : "All prices in EUR incl. VAT. Shipping costs shown at checkout. Free shipping above €100 in DE/AT/CH.",
  },
  {
    title: isDe ? "§ 4 Zahlung" : "§ 4 Payment",
    body: isDe
      ? "Akzeptierte Zahlungsmethoden werden im Checkout angezeigt. Aktuell Demo-Modus — keine echte Zahlungsabwicklung."
      : "Accepted payment methods shown at checkout. Currently demo mode — no real payment processing.",
  },
  {
    title: isDe ? "§ 5 Lieferung" : "§ 5 Delivery",
    body: isDe
      ? "Lieferung in der Regel innerhalb von 3-5 Werktagen nach Bestellbestätigung. Versand aus Berlin."
      : "Delivery typically within 3-5 business days after order confirmation. Shipped from Berlin.",
  },
  {
    title: isDe ? "§ 6 Eigentumsvorbehalt" : "§ 6 Reservation of title",
    body: isDe
      ? "Die Ware bleibt bis zur vollständigen Bezahlung Eigentum von Norevan."
      : "Goods remain Norevan's property until fully paid.",
  },
  {
    title: isDe ? "§ 7 Gewährleistung & Haftung" : "§ 7 Warranty & liability",
    body: isDe
      ? "Es gelten die gesetzlichen Gewährleistungsrechte. Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit gesetzlich zulässig."
      : "Statutory warranty rights apply. Liability for slight negligence excluded where permitted by law.",
  },
  {
    title: isDe ? "§ 8 Schlussbestimmungen" : "§ 8 Final provisions",
    body: isDe
      ? "Es gilt deutsches Recht. Gerichtsstand Berlin, soweit zulässig. EU-Streitschlichtung: ec.europa.eu/consumers/odr."
      : "German law applies. Place of jurisdiction Berlin where permitted. EU dispute resolution: ec.europa.eu/consumers/odr.",
  },
];

async function AgbContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const isDe = lang === "de";
  const sections = SECTIONS(isDe);

  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
        {isDe ? "Allgemeine Geschäftsbedingungen" : "Terms & conditions"}
      </span>
      <h1
        className="headline mt-3"
        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
      >
        AGB
      </h1>

      <div className="mt-10 flex flex-col divide-y divide-border-subtle">
        {sections.map((s) => (
          <section key={s.title} className="py-6 first:pt-0">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              {s.title}
            </h2>
            <p className="mt-3 text-sm leading-[1.7] text-foreground/85">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-sm border border-border-subtle bg-muted-bg/40 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          {isDe ? "Hinweis" : "Note"}
        </span>
        <p className="mt-2 text-sm leading-[1.65] text-foreground/80">
          {isDe
            ? "Platzhalter-Text. Vor Live-Schaltung anwaltlich prüfen lassen."
            : "Placeholder text. Have a lawyer review before going live."}
        </p>
      </div>
    </>
  );
}

export default function AgbPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return (
    <Suspense fallback={null}>
      <AgbContent params={params} />
    </Suspense>
  );
}
