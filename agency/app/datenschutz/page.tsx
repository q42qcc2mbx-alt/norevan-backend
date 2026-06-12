import type { Metadata } from "next";
import { legal, privacy, LEGAL_DATA_COMPLETE } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten nach DSGVO.",
  robots: { index: true, follow: true },
};

function field(value: string, placeholder: string) {
  return value.trim() ? value : `[${placeholder} eintragen]`;
}

export default function DatenschutzPage() {
  const responsible = [
    field(legal.companyName, "Firmenname"),
    legal.street,
    `${legal.postalCode} ${legal.city}`.trim(),
    legal.country,
  ]
    .filter((l) => l && l.trim())
    .join("\n");

  return (
    <div className="pt-16 md:pt-20">
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Rechtliches
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Datenschutzerklärung
        </h1>

        {!LEGAL_DATA_COMPLETE && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            <strong>Entwurf — noch nicht final.</strong> Verantwortliche-Angaben
            ergänzen (<code>lib/site.config.ts</code>) und vor Veröffentlichung
            anwaltlich/durch einen Generator prüfen lassen.
          </div>
        )}

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              1. Verantwortlicher
            </h2>
            <p className="whitespace-pre-line">{responsible}</p>
            <p className="mt-2">
              E-Mail:{" "}
              <a href={`mailto:${legal.email}`} className="text-accent hover:underline">
                {legal.email}
              </a>
              {legal.phone && <> · Telefon: {legal.phone}</>}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              2. Allgemeines zur Datenverarbeitung
            </h2>
            <p>
              Wir verarbeiten personenbezogene Daten unserer Nutzer
              grundsätzlich nur, soweit dies zur Bereitstellung einer
              funktionsfähigen Website sowie unserer Inhalte und Leistungen
              erforderlich ist. Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1
              lit. a (Einwilligung), lit. b (Vertrag/Anbahnung) und lit. f
              (berechtigtes Interesse) DSGVO.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              3. Hosting &amp; Server-Logs
            </h2>
            <p>
              Diese Website wird bei <strong>{privacy.host.name}</strong> (
              {privacy.host.address}) gehostet. Beim Aufruf werden technisch
              notwendige Daten (IP-Adresse, Datum/Uhrzeit, abgerufene Ressource,
              Referrer, Browser/Betriebssystem) verarbeitet, um die Auslieferung
              und Sicherheit der Seite zu gewährleisten (Art. 6 Abs. 1 lit. f
              DSGVO). Eine Datenübermittlung in die {privacy.host.transfer} kann
              stattfinden; sie ist durch geeignete Garantien (EU-Standard­vertrags­klauseln)
              abgesichert.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              4. Kontakt- &amp; Anfrageformulare
            </h2>
            <p>
              Wenn Sie uns über das Kontaktformular, die Projekt­anfrage oder das
              Feedback-Formular kontaktieren, verarbeiten wir die von Ihnen
              angegebenen Daten (z. B. Name, E-Mail, Website, Nachricht) zur
              Bearbeitung Ihrer Anfrage (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO).
              Die Speicherung erfolgt in unserer Datenbank bei{" "}
              <strong>{privacy.database.name}</strong>, Region{" "}
              {privacy.database.region}. {privacy.retention}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              5. KI-gestützte Website-Analyse &amp; Chat
            </h2>
            <p>
              Für die kostenlose Website-Analyse und den Chat-Assistenten nutzen
              wir die KI-Dienste von <strong>{privacy.ai.name}</strong>. Dabei
              werden die von Ihnen eingegebenen Inhalte (z. B. die zu
              analysierende Website-Adresse, Ihre Chat-Eingaben) zur Erstellung
              der Antwort verarbeitet. {privacy.ai.note} Rechtsgrundlage ist Ihre
              Anfrage bzw. unser berechtigtes Interesse an der Bereitstellung der
              Funktion (Art. 6 Abs. 1 lit. b/f DSGVO).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              6. Nutzerkonten &amp; Anmeldung
            </h2>
            <p>
              Für Kunden-/Team-Konten verwenden wir den Authentifizierungsdienst
              von {privacy.database.name}. Verarbeitet werden die zur Anmeldung
              erforderlichen Daten (E-Mail, verschlüsseltes Passwort,
              Zeitstempel). Rechtsgrundlage ist die Vertragserfüllung (Art. 6
              Abs. 1 lit. b DSGVO).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              7. Lokale Speicherung (kein Tracking)
            </h2>
            <p>
              Wir setzen <strong>keine</strong> Tracking- oder Werbe-Cookies ein.
              Im lokalen Speicher Ihres Browsers (localStorage) werden lediglich
              funktionale Einstellungen abgelegt — Ihre Sprachwahl, das hell/dunkel
              Design und die zuletzt gewählte Geräte-Ansicht. Diese Daten
              verlassen Ihren Browser nicht.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">8. Reichweitenmessung</h2>
            <p>
              Zur Verbesserung unseres Angebots nutzen wir{" "}
              <strong>Vercel Web Analytics</strong> — eine cookielose,
              datenschutzfreundliche Reichweitenmessung, die keine
              personenbezogenen Profile bildet und keine geräteübergreifende
              Wiedererkennung vornimmt (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">9. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht auf Auskunft (Art. 15), Berichtigung
              (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
              (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch
              (Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit
              mit Wirkung für die Zukunft widerrufen. Zudem steht Ihnen ein
              Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77
              DSGVO). Wenden Sie sich dazu an{" "}
              <a href={`mailto:${legal.email}`} className="text-accent hover:underline">
                {legal.email}
              </a>
              .
            </p>
          </div>

          <p className="border-t border-edge pt-6 text-xs text-ink-muted">
            Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}.
            Diese Datenschutzerklärung ist eine Vorlage und sollte vor der
            Veröffentlichung durch einen Datenschutz-Generator oder eine
            fachkundige Person an Ihren konkreten Betrieb angepasst werden.
          </p>
        </div>
      </section>
    </div>
  );
}
