import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/config";

type Block = { h?: string; p?: string[] };
type Doc = { title: string; updated: string; blocks: Block[] };

const DOCS = ["impressum", "datenschutz", "agb", "widerruf"] as const;
type DocSlug = (typeof DOCS)[number];

const PLACEHOLDER =
  "[BITTE ERGÄNZEN]";

// German legal templates. Company-specific data is marked [BITTE ERGÄNZEN].
// These are starting points and must be reviewed by a lawyer before going live.
const CONTENT: Record<DocSlug, Doc> = {
  impressum: {
    title: "Impressum",
    updated: "Angaben gemäß § 5 TMG",
    blocks: [
      {
        h: "Anbieter",
        p: [
          `Norevan UG (haftungsbeschränkt)`,
          `${PLACEHOLDER} Straße und Hausnummer`,
          `${PLACEHOLDER} PLZ und Ort`,
          `Deutschland`,
        ],
      },
      {
        h: "Vertreten durch",
        p: [`${PLACEHOLDER} Name der/des Geschäftsführer:in`],
      },
      {
        h: "Kontakt",
        p: [`E-Mail: hello@norevan.shop`, `Telefon: ${PLACEHOLDER}`],
      },
      {
        h: "Registereintrag",
        p: [
          `Eintragung im Handelsregister`,
          `Registergericht: ${PLACEHOLDER}`,
          `Registernummer: ${PLACEHOLDER}`,
        ],
      },
      {
        h: "Umsatzsteuer-ID",
        p: [
          `Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ${PLACEHOLDER}`,
        ],
      },
      {
        h: "Verbraucherstreitbeilegung",
        p: [
          "Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr/.",
          "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
        ],
      },
    ],
  },
  datenschutz: {
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert: 2026",
    blocks: [
      {
        h: "1. Verantwortlicher",
        p: [
          `Verantwortlich für die Datenverarbeitung auf dieser Website ist Norevan UG (haftungsbeschränkt), ${PLACEHOLDER} Anschrift, E-Mail: hello@norevan.shop.`,
        ],
      },
      {
        h: "2. Verarbeitete Daten",
        p: [
          "Konto & Bestellungen: E-Mail-Adresse, Name, Liefer-/Rechnungsadresse, Bestellhistorie — zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).",
          "Anmeldung: Login per E-Mail-Code (Einmal-Code) über unseren Auth-Dienstleister.",
          "Bewertungen: Anzeigename und Bewertungstext, sofern du eine Bewertung abgibst.",
        ],
      },
      {
        h: "3. Reichweitenmessung",
        p: [
          "Wir erfassen anonyme Seitenaufrufe (aufgerufene Seite, ungefähres Land, Gerätetyp, Referrer) in eigener Infrastruktur. Es werden keine IP-Adressen gespeichert und keine Cookies Dritter gesetzt. Die Messung erfolgt nur mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) über den Cookie-Hinweis.",
        ],
      },
      {
        h: "4. Zahlungsabwicklung",
        p: [
          "Zahlungen werden über Stripe abgewickelt. Dabei werden die für die Zahlung erforderlichen Daten an Stripe übermittelt. Es gilt zusätzlich die Datenschutzerklärung von Stripe.",
        ],
      },
      {
        h: "5. Hosting & Dienstleister",
        p: [
          `Website-Hosting, Datenbank und E-Mail-Versand erfolgen über Dienstleister, mit denen Auftragsverarbeitungsverträge bestehen (${PLACEHOLDER}: z. B. Vercel, Render, Supabase).`,
        ],
      },
      {
        h: "6. Deine Rechte",
        p: [
          "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, dich bei einer Aufsichtsbehörde zu beschweren. Anfragen an: hello@norevan.shop.",
        ],
      },
    ],
  },
  agb: {
    title: "Allgemeine Geschäftsbedingungen",
    updated: "Stand: 2026",
    blocks: [
      { h: "1. Geltungsbereich", p: ["Diese AGB gelten für alle Bestellungen über diesen Online-Shop durch Verbraucher und Unternehmer."] },
      { h: "2. Vertragspartner", p: [`Der Kaufvertrag kommt zustande mit der Norevan UG (haftungsbeschränkt), ${PLACEHOLDER} Anschrift.`] },
      { h: "3. Vertragsschluss", p: ["Die Darstellung der Produkte stellt kein bindendes Angebot dar. Mit dem Absenden der Bestellung gibst du ein verbindliches Angebot ab. Der Vertrag kommt mit unserer Bestellbestätigung bzw. Lieferung zustande."] },
      { h: "4. Preise & Versand", p: ["Alle Preise verstehen sich inkl. gesetzlicher Mehrwertsteuer. Etwaige Versandkosten werden im Bestellprozess angezeigt."] },
      { h: "5. Zahlung", p: ["Die Zahlung erfolgt über die im Checkout angebotenen Zahlarten (u. a. Stripe)."] },
      { h: "6. Lieferung", p: ["Die Lieferung erfolgt an die angegebene Lieferadresse innerhalb der angegebenen Lieferfrist."] },
      { h: "7. Eigentumsvorbehalt", p: ["Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum."] },
      { h: "8. Gewährleistung", p: ["Es gelten die gesetzlichen Gewährleistungsrechte."] },
      { h: "9. Widerrufsrecht", p: ["Verbrauchern steht ein Widerrufsrecht nach Maßgabe der Widerrufsbelehrung zu."] },
    ],
  },
  widerruf: {
    title: "Widerrufsbelehrung",
    updated: "Für Verbraucher",
    blocks: [
      { h: "Widerrufsrecht", p: ["Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter die Waren in Besitz genommen hat."] },
      { h: "Ausübung des Widerrufs", p: [`Um dein Widerrufsrecht auszuüben, musst du uns (Norevan UG, ${PLACEHOLDER} Anschrift, hello@norevan.shop) mittels einer eindeutigen Erklärung über deinen Entschluss informieren. Du kannst dafür das beigefügte Muster-Widerrufsformular verwenden, das ist aber nicht vorgeschrieben.`] },
      { h: "Folgen des Widerrufs", p: ["Wenn du diesen Vertrag widerrufst, erstatten wir dir alle erhaltenen Zahlungen unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deiner Widerrufsmitteilung zurück."] },
      { h: "Muster-Widerrufsformular", p: ["An Norevan UG, hello@norevan.shop: Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren (…). Bestellt am (…) / erhalten am (…). Name. Anschrift. Datum, Unterschrift (nur bei Mitteilung auf Papier)."] },
    ],
  },
};

export function generateStaticParams() {
  return locales.flatMap((lang) => DOCS.map((doc) => ({ lang, doc })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const d = CONTENT[doc as DocSlug];
  return d ? { title: `${d.title} — Norevan`, robots: { index: true } } : {};
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: Locale; doc: string }>;
}) {
  const { lang, doc } = await params;
  if (!locales.includes(lang)) notFound();
  const d = CONTENT[doc as DocSlug];
  if (!d) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
        {d.updated}
      </span>
      <h1
        className="mt-3 font-serif"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1 }}
      >
        {d.title}
      </h1>

      <p className="mt-6 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/5 px-4 py-3 font-mono text-[11px] leading-relaxed text-muted">
        Hinweis: Dies ist eine Vorlage. Bitte ergänze die mit „{PLACEHOLDER}“
        markierten Angaben und lass die Texte vor dem Live-Gang rechtlich prüfen.
      </p>

      <div className="mt-10 space-y-8">
        {d.blocks.map((b, i) => (
          <section key={i}>
            {b.h && (
              <h2 className="mb-2 text-lg font-medium text-foreground">{b.h}</h2>
            )}
            {b.p?.map((para, j) => (
              <p key={j} className="mb-2 text-sm leading-relaxed text-foreground/80">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
