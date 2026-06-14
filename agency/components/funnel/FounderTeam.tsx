"use client";

import { Code2, Palette, ShieldCheck, TrendingUp } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

// Trust without anonymity — shown by discipline, not by name.
const TEAM = [
  { role: "Entwicklung & Architektur", icon: Code2, gradient: "from-blue-500 to-indigo-500" },
  { role: "Design & Conversion", icon: Palette, gradient: "from-cyan-500 to-blue-500" },
  { role: "Sicherheit & Performance", icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500" },
  { role: "SEO & Wachstum", icon: TrendingUp, gradient: "from-violet-500 to-purple-500" },
];

export default function FounderTeam() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            Keine Agentur-Maschine. <span className="text-gradient">Echte Spezialisten.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Vier Spezialisten für Entwicklung, Design, Sicherheit und Wachstum analysieren Ihre
            Seite persönlich — kein Bot, kein Praktikant. Genau deshalb sind die Plätze begrenzt.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-8">
          {TEAM.map(({ role, icon: Icon, gradient }, i) => (
            <Reveal key={role} delay={i * 0.08}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg ring-4 ring-page md:h-24 md:w-24`}
                  aria-hidden
                >
                  <Icon className="h-9 w-9" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink md:text-base">{role}</h3>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <blockquote className="mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-ink-soft italic md:text-xl">
            „Wir empfehlen nur, was Ihrem Ziel wirklich dient — auch wenn das mal die kleinere
            Lösung ist. Vertrauen ist unsere wichtigste Währung.“
          </blockquote>
          <p className="mt-3 font-display font-semibold text-ink">— Das Team von NOREVAN Digital</p>
        </Reveal>
      </div>
    </section>
  );
}
