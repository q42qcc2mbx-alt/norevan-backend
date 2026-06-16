import type { Metadata } from "next";
import { legal, LEGAL_DATA_COMPLETE } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung und Pflichtangaben nach § 5 DDG.",
  robots: { index: true, follow: true },
};

/** Zeigt den Wert oder einen deutlich erkennbaren Platzhalter. */
function field(value: string, placeholder: string) {
  return value.trim() ? value : `[${placeholder} eintragen]`;
}

export default function ImpressumPage() {
  return (
    <div className="pt-16 md:pt-20">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Rechtliches
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Impressum
        </h1>

        {!LEGAL_DATA_COMPLETE && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            <strong>Entwurf — noch nicht final.</strong> Diese Pflichtangaben
            müssen vor der Veröffentlichung mit echten Firmendaten gefüllt
            werden (Datei <code>lib/site.config.ts</code>).
          </div>
        )}

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              Angaben gemäß § 5 DDG
            </h2>
            <p className="whitespace-pre-line">
              {field(legal.companyName, "Firmenname inkl. Rechtsform")}
              {"\n"}
              {field(legal.street, "Straße & Hausnummer")}
              {"\n"}
              {field(legal.postalCode, "PLZ")} {field(legal.city, "Ort")}
              {"\n"}
              {legal.country}
            </p>
          </div>

          {(legal.representative || !LEGAL_DATA_COMPLETE) && (
            <div>
              <h2 className="mb-2 text-base font-semibold text-ink">Vertreten durch</h2>
              <p>{field(legal.representative, "Vertretungsberechtigte Person")}</p>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">Kontakt</h2>
            <p>
              {legal.phone && (
                <>
                  Telefon: {legal.phone}
                  <br />
                </>
              )}
              E-Mail:{" "}
              <a
                href={`mailto:${legal.email}`}
                className="text-accent hover:underline"
              >
                {legal.email}
              </a>
            </p>
          </div>

          {(legal.vatId || !LEGAL_DATA_COMPLETE) && (
            <div>
              <h2 className="mb-2 text-base font-semibold text-ink">
                Umsatzsteuer-ID
              </h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{" "}
                {legal.vatId || "[USt-IdNr. eintragen, falls vorhanden]"}
              </p>
            </div>
          )}

          {(legal.registerCourt || legal.registerNumber) && (
            <div>
              <h2 className="mb-2 text-base font-semibold text-ink">
                Handelsregister
              </h2>
              <p>
                {legal.registerCourt && <>Registergericht: {legal.registerCourt}<br /></>}
                {legal.registerNumber && <>Registernummer: {legal.registerNumber}</>}
              </p>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="whitespace-pre-line">
              {legal.contentResponsible ||
                field(legal.representative, "Verantwortliche Person")}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">
              EU-Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">Haftung für Links</h2>
            <p>
              Unser Angebot enthält ggf. Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
              der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-ink">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge
              Dritter sind als solche gekennzeichnet. Die Vervielfältigung,
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
