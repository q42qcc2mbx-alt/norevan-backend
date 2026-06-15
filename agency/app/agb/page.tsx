import type { Metadata } from "next";
import { legal, LEGAL_DATA_COMPLETE } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von NOREVAN Digital.",
  robots: { index: true, follow: true },
};

function company() {
  return legal.companyName.trim() || "[Firmenname eintragen]";
}

const sections: { h: string; p: string }[] = [
  {
    h: "1. Geltungsbereich",
    p: `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen ${"{C}"} (nachfolgend „Agentur") und dem Auftraggeber über die Erstellung, Optimierung, Wartung und Absicherung von Websites sowie damit verbundene Leistungen. Abweichende Bedingungen des Auftraggebers gelten nur, soweit die Agentur ihnen ausdrücklich schriftlich zugestimmt hat.`,
  },
  {
    h: "2. Angebot & Vertragsschluss",
    p: "Angebote der Agentur sind freibleibend. Ein Vertrag kommt zustande, wenn der Auftraggeber das Angebot schriftlich (auch per E-Mail) annimmt oder die Agentur mit der Ausführung beginnt. Der Leistungsumfang ergibt sich aus dem jeweiligen Angebot.",
  },
  {
    h: "3. Leistungen & Mitwirkung des Auftraggebers",
    p: "Die Agentur erbringt die im Angebot beschriebenen Leistungen mit der gebotenen Sorgfalt. Der Auftraggeber stellt rechtzeitig alle erforderlichen Inhalte, Zugänge (z. B. Hosting, CMS, Domain) und Informationen bereit. Verzögerungen aufgrund fehlender Mitwirkung verlängern Fristen entsprechend.",
  },
  {
    h: "4. Preise & Zahlung",
    p: "Es gelten die im Angebot genannten Preise zzgl. der gesetzlichen Umsatzsteuer. Sofern nicht anders vereinbart, ist bei Auftragserteilung eine Anzahlung von 30–50 % fällig; der Restbetrag ist vor der Freischaltung/Übergabe bzw. nach Abnahme zu zahlen. Rechnungen sind innerhalb von 14 Tagen ohne Abzug zu begleichen. Bei Zahlungsverzug ist die Agentur berechtigt, Arbeiten und Bereitstellungen bis zum Zahlungseingang auszusetzen.",
  },
  {
    h: "5. Eigentumsvorbehalt & Nutzungsrechte",
    p: "Sämtliche im Rahmen des Auftrags erstellten Werke (Code, Design, Inhalte) bleiben bis zur vollständigen Bezahlung Eigentum der Agentur. Die Nutzungs- und Verwertungsrechte gehen erst mit vollständiger Zahlung aller offenen Beträge auf den Auftraggeber über. Vor vollständiger Zahlung erfolgt keine Live-Schaltung auf der Domain des Auftraggebers und keine Herausgabe von Quelldateien oder Zugängen.",
  },
  {
    h: "6. Termine & Lieferung",
    p: "Termine sind nur verbindlich, wenn sie ausdrücklich schriftlich als verbindlich vereinbart wurden. Die Auslieferung erfolgt je nach Vereinbarung durch Live-Schaltung, Übergabe von Zugängen oder Bereitstellung der Dateien.",
  },
  {
    h: "7. Abnahme",
    p: "Die fertiggestellte Leistung wird dem Auftraggeber zur Abnahme bereitgestellt (z. B. auf einer Vorschau-Adresse). Erfolgt innerhalb von 14 Tagen keine begründete, schriftliche Beanstandung, gilt die Leistung als abgenommen.",
  },
  {
    h: "8. Gewährleistung",
    p: "Die Agentur gewährleistet die vertragsgemäße Erbringung der Leistungen. Mängel sind unverzüglich schriftlich anzuzeigen; die Agentur erhält Gelegenheit zur Nachbesserung. Für Inhalte, Soft- oder Hardware Dritter sowie für vom Auftraggeber gestellte Inhalte wird keine Gewähr übernommen.",
  },
  {
    h: "9. Haftung",
    p: "Die Agentur haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie für Schäden aus der Verletzung von Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet die Agentur nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Eine weitergehende Haftung ist ausgeschlossen.",
  },
  {
    h: "10. Vertraulichkeit & Datenschutz",
    p: "Beide Parteien behandeln vertrauliche Informationen der jeweils anderen Partei vertraulich. Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung und den geltenden datenschutzrechtlichen Bestimmungen (DSGVO).",
  },
  {
    h: "11. Laufzeit & Kündigung",
    p: "Wartungs- und Betreuungsverträge können von beiden Seiten mit einer Frist von 30 Tagen zum Monatsende gekündigt werden, sofern nicht anders vereinbart. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.",
  },
  {
    h: "12. Schlussbestimmungen",
    p: "Es gilt das Recht der Bundesrepublik Deutschland. Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Änderungen und Ergänzungen bedürfen der Textform.",
  },
];

export default function AgbPage() {
  return (
    <div className="pt-16 md:pt-20">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">Rechtliches</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Allgemeine Geschäftsbedingungen
        </h1>

        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <strong>Entwurf — bitte anwaltlich prüfen lassen.</strong> Diese AGB sind eine
          Vorlage und ersetzen keine Rechtsberatung. Lassen Sie den Text vor dem Einsatz von
          einer Anwältin/einem Anwalt prüfen und an Ihr Geschäftsmodell anpassen.
        </div>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-ink-soft">
          {sections.map(({ h, p }) => (
            <div key={h}>
              <h2 className="mb-2 text-base font-semibold text-ink">{h}</h2>
              <p className="whitespace-pre-line">{p.replace("{C}", company())}</p>
            </div>
          ))}
          <p className="text-xs text-ink-muted">
            Stand: {new Date().getFullYear()} · {company()}
            {!LEGAL_DATA_COMPLETE && " · (Firmenname wird automatisch aus den Stammdaten gefüllt.)"}
          </p>
        </div>
      </section>
    </div>
  );
}
