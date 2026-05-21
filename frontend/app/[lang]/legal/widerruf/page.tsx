import { Suspense } from "react";
import { locales, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "Widerrufsbelehrung — Norevan",
  description: "Widerrufsrecht für Verbraucher.",
};

async function WiderrufContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const isDe = lang === "de";

  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
        {isDe ? "§ 312g BGB" : "Withdrawal"}
      </span>
      <h1
        className="headline mt-3"
        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
      >
        {isDe ? "Widerrufsbelehrung" : "Right of withdrawal"}
      </h1>

      <div className="mt-10 space-y-6 text-sm leading-[1.7] text-foreground/85">
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Widerrufsrecht" : "Right of withdrawal"}
          </h2>
          <p className="mt-3">
            {isDe
              ? "Du hast das Recht, binnen 30 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt 30 Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Ware in Besitz genommen hast."
              : "You have the right to withdraw from this contract within 30 days without giving any reason. The withdrawal period is 30 days from the day on which you or a third party other than the carrier indicated by you took possession of the goods."}
          </p>
        </section>
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Folgen des Widerrufs" : "Consequences of withdrawal"}
          </h2>
          <p className="mt-3">
            {isDe
              ? "Wir erstatten alle Zahlungen unverzüglich, spätestens binnen 14 Tagen ab Eingang des Widerrufs. Die Rücksendekosten trägt der Käufer."
              : "We will refund all payments without delay, at the latest within 14 days of receiving the withdrawal. Return shipping costs are borne by the buyer."}
          </p>
        </section>
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Wertersatz" : "Compensation for value"}
          </h2>
          <p className="mt-3">
            {isDe
              ? "Du musst für einen etwaigen Wertverlust nur aufkommen, wenn dieser auf einen unsachgemäßen Umgang zurückzuführen ist."
              : "You only have to pay for any loss of value if such loss is due to improper handling."}
          </p>
        </section>
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {isDe ? "Widerruf erklären" : "How to withdraw"}
          </h2>
          <p className="mt-3">
            {isDe
              ? "Sende eine eindeutige Erklärung (z.B. E-Mail) an: Norevan UG, hello@norevan.shop. Du kannst auch das Muster-Widerrufsformular verwenden."
              : "Send an unambiguous statement (e.g. email) to: Norevan UG, hello@norevan.shop. You may also use the model withdrawal form."}
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-sm border border-border-subtle bg-muted-bg/40 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          {isDe ? "Hinweis" : "Note"}
        </span>
        <p className="mt-2 text-sm leading-[1.65] text-foreground/80">
          {isDe
            ? "Diese Belehrung ist ein Demo-Platzhalter und ersetzt keine anwaltliche Prüfung."
            : "This notice is a demo placeholder and does not replace legal review."}
        </p>
      </div>
    </>
  );
}

export default function WiderrufPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return (
    <Suspense fallback={null}>
      <WiderrufContent params={params} />
    </Suspense>
  );
}
