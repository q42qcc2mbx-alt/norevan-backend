"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  KeyRound,
  Minus,
  ScanSearch,
  ShieldCheck,
  Trophy,
  Wrench,
} from "lucide-react";
import { solutions } from "@/lib/site.config";
import Aurora from "@/components/ui/Aurora";

// Three commercial paths — Optimieren / Mieten (WaaS) / Kaufen — with a
// decision-helper and anchor psychology (the middle "Mieten" plan is the
// recommended MRR driver). German-only marketing copy, so dir="ltr" is forced
// to stay correct even when the visitor switched the site to Arabic (RTL).

type Path = "optimieren" | "mieten" | "kaufen";

const NEEDS: { label: string; sub: string; target: Path }[] = [
  { label: "Verbessern", sub: "Ich habe schon eine Seite", target: "optimieren" },
  { label: "Sorglos sein", sub: "Ich will mich um nichts kümmern", target: "mieten" },
  { label: "Besitzen", sub: "Ich will eine eigene Premium-Seite", target: "kaufen" },
];

interface Plan {
  id: Path;
  icon: typeof Wrench;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  model: string;
  features: string[];
  notIncluded?: string[];
  cta: { label: string; href: string };
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "optimieren",
    icon: Wrench,
    name: "Optimieren",
    tagline: "Für alle, die schon eine Website haben, die nur nicht genug bringt.",
    price: solutions.optimieren.price,
    priceNote: "einmalig",
    model: "Der schnelle Hebel",
    features: [
      "Kostenlose KI-Analyse vorab",
      "Gezielte Verbesserungen (Tempo, SEO, Conversion)",
      "Mehr Sicherheit & saubere Technik",
      "Vorher-Nachher-Report — Ergebnisse in Zahlen",
    ],
    notIncluded: ["Laufende Betreuung", "Hosting & Sicherheit inklusive"],
    cta: { label: "Kostenlose Analyse starten", href: "/analyse" },
  },
  {
    id: "mieten",
    icon: KeyRound,
    name: "Mieten",
    tagline: "Top-Website ohne Aufwand, ohne große Investition, ohne Risiko.",
    price: solutions.mieten.price,
    priceNote: "monatlich · jederzeit kündbar",
    model: "Das Rundum-sorglos-Paket",
    features: [
      "Professioneller Neubau Ihrer Website",
      "Hosting, SSL & EU-Server inklusive",
      "Sicherheit, Backups & Updates inklusive",
      "Laufende Optimierung & Support",
      "Zugang zum Kundenportal",
      "Keine hohe Anzahlung",
    ],
    cta: { label: "Miete anfragen", href: "/anfrage" },
    popular: true,
  },
  {
    id: "kaufen",
    icon: Trophy,
    name: "Kaufen",
    tagline: "Für alle, die ihre Premium-Website besitzen und voll kontrollieren wollen.",
    price: solutions.kaufen.price,
    priceNote: "einmalig",
    model: "Eigentum & volle Kontrolle",
    features: [
      "Maßgeschneiderter Premium-Neubau",
      "Sie besitzen die fertige Website",
      "Blitzschnell, mobil-optimiert, conversion-stark",
      "Optional: Wartung & Sicherheit als Upgrade",
    ],
    notIncluded: ["Laufende Pflege nur als Zusatz"],
    cta: { label: "Projekt anfragen", href: "/anfrage" },
  },
];

export default function Solutions() {
  const [active, setActive] = useState<Path | null>(null);

  return (
    <section dir="ltr" className="relative overflow-hidden px-5 pt-28 pb-20 text-left md:px-8 md:pt-32">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <Aurora />

      <div className="relative mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-accent to-cyan-glow" />
            Mieten · Kaufen · Optimieren
          </span>
          <h1 className="font-display text-[1.85rem] leading-[1.15] font-bold tracking-tight text-balance text-ink sm:text-4xl md:text-5xl">
            Wo stehen Sie gerade?{" "}
            <span className="text-gradient">Wählen Sie Ihren Weg.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Drei Wege, ein Ziel: eine Website, die schnell, sicher und erfolgreich ist.
            Sagen Sie uns, was Sie brauchen — wir zeigen Ihnen die passende Option.
          </p>
        </div>

        {/* Decision helper */}
        <div className="mx-auto mt-9 max-w-2xl">
          <p className="mb-3 text-center text-sm font-semibold text-ink-soft">
            Was trifft auf Sie zu?
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {NEEDS.map((need) => {
              const on = active === need.target;
              return (
                <button
                  key={need.target}
                  type="button"
                  onClick={() => setActive(on ? null : need.target)}
                  className={`rounded-2xl border p-4 text-center transition-all ${
                    on
                      ? "border-accent bg-accent/[0.07] shadow-md shadow-accent/15"
                      : "border-edge bg-surface hover:border-accent/40"
                  }`}
                >
                  <span className={`block text-sm font-bold ${on ? "text-accent" : "text-ink"}`}>
                    {need.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{need.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan cards */}
        <div className="mt-10 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isMatch = active === plan.id;
            const emphasised = isMatch || (active === null && plan.popular);
            return (
              <div
                key={plan.id}
                className={`relative flex h-full flex-col rounded-3xl border p-6 transition-all md:p-7 ${
                  emphasised
                    ? "border-accent bg-surface shadow-xl shadow-accent/15 lg:-translate-y-2"
                    : "border-edge bg-surface/70"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-cyan-glow px-3.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-md">
                    Beliebteste Wahl
                  </span>
                )}
                {isMatch && !plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3.5 py-1 text-[11px] font-bold tracking-wide text-page uppercase shadow-md">
                    Für Sie
                  </span>
                )}

                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    emphasised
                      ? "bg-gradient-to-br from-accent to-cyan-glow text-white"
                      : "bg-accent/10 text-accent ring-1 ring-accent/15"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <h2 className="mt-4 font-display text-xl font-bold text-ink">{plan.name}</h2>
                <p className="mt-1 text-xs font-semibold tracking-wide text-accent uppercase">
                  {plan.model}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{plan.tagline}</p>

                <div className="mt-5 border-t border-edge pt-4">
                  <p className="font-display text-2xl font-bold text-ink">{plan.price}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{plan.priceNote}</p>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded?.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted/60" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.cta.href}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                    emphasised ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {plan.cta.href === "/analyse" ? (
                    <ScanSearch className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {plan.cta.label}
                </Link>
              </div>
            );
          })}
        </div>

        {/* CapEx vs OpEx — the decisive B2B argument */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="card-elevated p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-ink">
              <KeyRound className="h-5 w-5 text-accent" />
              Warum Mieten oft die klügere Wahl ist
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              <strong className="text-ink">Kaufen</strong> ist eine große Einmal-Investition
              (CapEx), die mit der Zeit altert.{" "}
              <strong className="text-ink">Mieten</strong> ist eine planbare, monatliche
              Betriebsausgabe (OpEx) — meist sofort steuerlich absetzbar. Ihre Website altert
              nie: Sie bleibt immer aktuell, schnell und sicher, ohne dass Sie sich kümmern.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Hosting, SSL, Backups, Updates, Support und Optimierung sind enthalten — einzeln
              gekauft kostet das ein Vielfaches.
            </p>
          </div>
          <div className="card-elevated p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-ink">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Kein Risiko, egal wofür Sie sich entscheiden
            </h3>
            <ul className="mt-3 space-y-2.5">
              {[
                "Jedes Projekt startet mit der kostenlosen Analyse — Sie wissen vorher, woran Sie sind.",
                "Festpreis vorab, keine versteckten Kosten.",
                "EU-Server, DSGVO-konform, SSL-verschlüsselt.",
                "Miete jederzeit kündbar — Sie bleiben, weil es sich lohnt.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bridge back to the funnel */}
        <div className="mt-12 text-center">
          <p className="text-sm text-ink-soft">
            Noch unsicher, welcher Weg passt? Die kostenlose Analyse zeigt es in 30 Sekunden.
          </p>
          <Link
            href="/analyse"
            className="btn-primary mt-4 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold"
          >
            <ScanSearch className="h-5 w-5" />
            Kostenlose Analyse starten
          </Link>
        </div>
      </div>
    </section>
  );
}
