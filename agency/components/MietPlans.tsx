import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  KeyRound,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { solutions } from "@/lib/site.config";
import Aurora from "@/components/ui/Aurora";

// "Website mieten" (WaaS) detail page: the recurring-revenue offer. Three
// tiers with the middle one anchored as recommended, an "always included"
// value strip, the process, and rent-specific objection handling. German
// copy → dir="ltr" so it stays correct even when the site is in Arabic (RTL).

const { mieten } = solutions;

const STEPS = [
  { n: "1", title: "Kostenlose Analyse", desc: "Wir schauen uns Ihre Situation an — unverbindlich und ehrlich." },
  { n: "2", title: "Konzept & Festpreis", desc: "Sie wählen Ihre Stufe. Klarer Monatspreis, keine versteckten Kosten." },
  { n: "3", title: "Wir bauen alles auf", desc: "Design, Technik, Sicherheit, Hosting — Sie müssen sich um nichts kümmern." },
  { n: "4", title: "Launch & Betreuung", desc: "Ihre Seite geht live und bleibt dauerhaft schnell, sicher und aktuell." },
];

const FAQ = [
  {
    q: "Gehört mir die Website dann?",
    a: "Im Mietmodell betreiben wir die Website für Sie — ähnlich wie beim Leasing. Sie zahlen monatlich und müssen sich um nichts kümmern. Wenn Sie lieber Eigentum möchten, ist unser Kauf-Modell das Richtige.",
  },
  {
    q: "Wie lange bin ich gebunden?",
    a: "Fair und transparent: kurze Mindestlaufzeit, danach monatlich kündbar. Wir setzen auf Qualität statt auf Knebelverträge — Sie bleiben, weil es sich lohnt.",
  },
  {
    q: "Muss ich eine hohe Summe vorab zahlen?",
    a: "Nein. Genau das ist der Vorteil: kein großer Einmalbetrag, sondern eine planbare monatliche Gebühr — meist sofort steuerlich absetzbar.",
  },
  {
    q: "Sind Änderungen inklusive?",
    a: "Ja. Kleine Anpassungen (Texte, Bilder, Öffnungszeiten) sind je nach Stufe monatlich enthalten. Größere Erweiterungen stimmen wir transparent ab.",
  },
  {
    q: "Was passiert, wenn ich kündige?",
    a: "Sie sind frei. Wir unterstützen Sie beim Umzug, und auf Wunsch bieten wir eine Kauf-Option, mit der Sie Ihre Seite übernehmen können.",
  },
];

export default function MietPlans() {
  return (
    <section dir="ltr" className="relative overflow-hidden px-5 pt-28 pb-20 text-left md:px-8 md:pt-32">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <Aurora />

      <div className="relative mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase">
            <KeyRound className="h-3.5 w-3.5" />
            Website mieten · Rundum-sorglos
          </span>
          <h1 className="font-display text-[1.85rem] leading-[1.15] font-bold tracking-tight text-balance text-ink sm:text-4xl md:text-5xl">
            Ihre Website. Komplett betreut.{" "}
            <span className="text-gradient">Ab {mieten.tiers[0].price}/Monat.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Profi-Website ohne große Investition und ohne Technik-Stress. Wir bauen, hosten,
            sichern und pflegen — Sie kümmern sich um Ihr Geschäft. Planbar monatlich,
            jederzeit fair kündbar.
          </p>
        </div>

        {/* Always included */}
        <div className="mt-10 rounded-3xl border border-edge bg-surface/70 p-6 md:p-7">
          <h2 className="flex items-center justify-center gap-2 text-center text-base font-bold text-ink">
            <ShieldCheck className="h-5 w-5 text-accent" />
            In jeder Stufe immer inklusive
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {mieten.alwaysIncluded.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl border border-edge bg-card px-3 py-2.5 text-xs font-medium text-ink-soft"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="mt-10 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          {mieten.tiers.map((tier) => {
            const hot = tier.highlight;
            return (
              <div
                key={tier.name}
                className={`relative flex h-full flex-col rounded-3xl border p-6 transition-all md:p-7 ${
                  hot
                    ? "border-accent bg-surface shadow-xl shadow-accent/15 lg:-translate-y-2"
                    : "border-edge bg-surface/70"
                }`}
              >
                {hot && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-cyan-glow px-3.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-md">
                    Beliebteste Wahl
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-ink">{tier.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tier.tagline}</p>

                <div className="mt-5 border-t border-edge pt-4">
                  <span className="font-display text-3xl font-bold text-ink">{tier.price}</span>
                  <span className="text-sm font-medium text-ink-muted">{tier.per}</span>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/anfrage"
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                    hot ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {tier.name} anfragen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-ink-muted">
          Alle Preise zzgl. USt. · Orientierungspreise — der genaue Umfang wird im kostenlosen
          Erstgespräch festgelegt.
        </p>

        {/* How it works */}
        <div className="mt-14">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            So einfach läuft es ab
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card-surface p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan-glow text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14 mx-auto max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Häufige Fragen zur Miete
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-edge bg-surface/70 p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-ink marker:content-['']">
                  {item.q}
                  <span className="text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-base font-semibold text-ink">Nicht sicher, welche Stufe passt?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Starten Sie mit der kostenlosen Analyse — danach empfehlen wir Ihnen die passende Stufe.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/analyse"
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
            >
              <ScanSearch className="h-5 w-5" />
              Kostenlose Analyse
            </Link>
            <Link
              href="/anfrage"
              className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold sm:w-auto"
            >
              Direkt anfragen
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
