"use client";

import { TrendingDown, Clock, Trophy } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

// The "Cost of Inaction" — speaks only the language of money, no tech jargon.
const CARDS = [
  {
    icon: Clock,
    stat: "Über die Hälfte",
    title: "Ihrer Besucher ist weg, bevor die Seite lädt",
    text: "Lädt Ihre Seite länger als 3 Sekunden, springt mehr als jeder zweite Besucher ab. Jeder von ihnen war ein möglicher Kunde — verloren an die Ladezeit.",
  },
  {
    icon: TrendingDown,
    stat: "Jeden Tag",
    title: "stiller Umsatz, den Sie nie zu Gesicht bekommen",
    text: "Eine Website, die nicht verkauft, kostet Sie nicht nichts — sie kostet Sie täglich Aufträge. Anfragen, die nie ankommen. Niemand sagt es Ihnen.",
  },
  {
    icon: Trophy,
    stat: "Ihr Wettbewerber",
    title: "kassiert die Kunden, die eigentlich Sie suchen",
    text: "Während Sie zögern, gewinnt die schnellere, klarere Seite. Sichtbarkeit, Vertrauen und Aufträge gehen an den, der zuerst optimiert — nicht an den Besseren.",
  },
];

export default function CostOfInaction() {
  return (
    <section className="relative border-t border-edge bg-card/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            Was Sie eine <span className="text-gradient">„okaye“ Website</span> wirklich kostet
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">
            Es geht nicht um Technik. Es geht um Umsatz, den Sie nicht sehen.
          </p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {CARDS.map(({ icon: Icon, stat, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="card-surface h-full p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-5 font-display text-2xl font-bold text-ink">{stat}</p>
                <h3 className="mt-1 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-base leading-relaxed text-ink-soft">
            Die gute Nachricht: Jeder dieser Punkte ist <span className="font-semibold text-ink">messbar</span> — und
            behebbar. Der erste Schritt ist, zu wissen, wie groß das Leck ist.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
