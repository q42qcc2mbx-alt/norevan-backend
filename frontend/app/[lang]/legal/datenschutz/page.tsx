import { locales, type Locale } from "@/lib/i18n/config";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "Datenschutz — Norevan",
  description: "Datenschutzerklärung gemäß DSGVO.",
};

const SECTIONS = (isDe: boolean) => [
  {
    title: isDe ? "Verantwortlicher" : "Controller",
    body: isDe
      ? "Norevan UG (haftungsbeschränkt), Musterstraße 1, 10115 Berlin. Kontakt: hello@norevan.shop."
      : "Norevan UG (limited), Musterstraße 1, 10115 Berlin. Contact: hello@norevan.shop.",
  },
  {
    title: isDe ? "Erhebung und Verarbeitung" : "Collection & processing",
    body: isDe
      ? "Beim Besuch unserer Website werden technische Daten (IP-Adresse, Browser, Zeitstempel) erfasst, soweit für den Betrieb erforderlich. Bestelldaten werden zur Vertragsabwicklung verarbeitet."
      : "When you visit our site we record technical data (IP, browser, timestamp) as required for operation. Order data is processed to fulfill the contract.",
  },
  {
    title: isDe ? "Cookies & lokaler Speicher" : "Cookies & local storage",
    body: isDe
      ? "Wir verwenden technisch notwendige Cookies (Theme, Sprache, Warenkorb). Tracking findet aktuell nicht statt."
      : "We use technically necessary cookies (theme, language, cart). No tracking at this time.",
  },
  {
    title: isDe ? "Zahlungsdienstleister" : "Payment providers",
    body: isDe
      ? "Beim Checkout werden Zahlungsdaten direkt an unseren Zahlungsdienstleister übermittelt. Aktuell läuft Norevan im Demo-Modus — es findet keine echte Zahlungsabwicklung statt."
      : "At checkout, payment data is transmitted directly to our payment provider. Norevan currently runs in demo mode — no real payment processing.",
  },
  {
    title: isDe ? "Deine Rechte" : "Your rights",
    body: isDe
      ? "Du hast jederzeit Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Beschwerden an die zuständige Aufsichtsbehörde."
      : "You have the right to access, rectification, deletion, restriction, portability, and objection. Complaints to the competent supervisory authority.",
  },
  {
    title: isDe ? "Speicherdauer" : "Retention",
    body: isDe
      ? "Daten werden nur so lange gespeichert, wie für den Zweck erforderlich oder gesetzlich vorgeschrieben (z.B. 10 Jahre für Rechnungen nach HGB)."
      : "Data is stored only as long as needed for the purpose or required by law (e.g. 10 years for invoices under HGB).",
  },
];

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const isDe = lang === "de";
  const sections = SECTIONS(isDe);

  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">DSGVO</span>
      <h1
        className="headline mt-3"
        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
      >
        {isDe ? "Datenschutzerklärung" : "Privacy notice"}
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
            ? "Platzhalter-Text. Vor Live-Schaltung von einem Datenschutzbeauftragten oder Anwalt prüfen lassen."
            : "Placeholder text. Have a privacy officer or lawyer review before going live."}
        </p>
      </div>
    </>
  );
}
