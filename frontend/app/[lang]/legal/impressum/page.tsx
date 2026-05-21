import { Suspense } from "react";
import { locales, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "Impressum — Norevan",
  description: "Impressum gemäß § 5 TMG.",
};

async function ImpressumContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const isDe = lang === "de";

  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
        {isDe ? "§ 5 TMG" : "Imprint"}
      </span>
      <h1
        className="headline mt-3"
        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
      >
        {isDe ? "Impressum" : "Imprint"}
      </h1>

      <section className="mt-10 grid gap-8 text-sm leading-[1.7] text-foreground/85 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Anbieter" : "Operator"}
          </h2>
          <p>
            Norevan UG (haftungsbeschränkt)
            <br />
            Musterstraße 1<br />
            10115 Berlin
            <br />
            Deutschland
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Kontakt" : "Contact"}
          </h2>
          <p>
            E-Mail: hello@norevan.shop
            <br />
            Telefon: +49 (0) 30 000 000 00
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Vertreten durch" : "Represented by"}
          </h2>
          <p>Geschäftsführer: Vorname Nachname</p>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Registereintrag" : "Registration"}
          </h2>
          <p>
            Amtsgericht Berlin-Charlottenburg
            <br />
            HRB 000000 B<br />
            USt-IdNr.: DE000000000
          </p>
        </div>
      </section>

      <div className="mt-12 rounded-sm border border-border-subtle bg-muted-bg/40 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          {isDe ? "Hinweis" : "Note"}
        </span>
        <p className="mt-2 text-sm leading-[1.65] text-foreground/80">
          {isDe
            ? "Dieses Impressum ist ein Platzhalter für die Demo. Vor Live-Schaltung müssen alle Angaben durch echte Daten ersetzt und juristisch geprüft werden."
            : "This imprint is a placeholder. Before going live, replace all entries with real data and have it legally reviewed."}
        </p>
      </div>
    </>
  );
}

export default function ImpressumPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return (
    <Suspense fallback={null}>
      <ImpressumContent params={params} />
    </Suspense>
  );
}
