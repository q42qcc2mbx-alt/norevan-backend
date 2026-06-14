"use client";

import Reveal from "@/components/ui/Reveal";

// Breaks the anonymity: real people behind NOREVAN. Avatars are initials in the
// brand gradient (no stock photos) until real team photos are added (Phase 2).
const TEAM = [
  { name: "Ahmad", role: "Gründer & Entwicklung", initials: "A", gradient: "from-blue-500 to-indigo-500" },
  { name: "Mohammad", role: "Design & Conversion", initials: "M", gradient: "from-cyan-500 to-blue-500" },
  { name: "Mazen", role: "Sicherheit & Performance", initials: "M", gradient: "from-emerald-500 to-teal-500" },
  { name: "Abdulghani", role: "SEO & Wachstum", initials: "A", gradient: "from-violet-500 to-purple-500" },
];

export default function FounderTeam() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink md:text-4xl">
            Keine Agentur-Maschine. <span className="text-gradient">Echte Menschen.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Wir machen diese Analyse selbst — kein Bot, kein Praktikant. Genau deshalb sind die
            Plätze begrenzt.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-8">
          {TEAM.map(({ name, role, initials, gradient }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-lg ring-4 ring-page md:h-24 md:w-24`}
                >
                  {initials}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{name}</h3>
                <p className="mt-0.5 text-sm text-ink-muted">{role}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <blockquote className="mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-ink-soft italic md:text-xl">
            „Wir empfehlen nur, was Ihrem Ziel wirklich dient — auch wenn das mal die kleinere
            Lösung ist. Vertrauen ist unsere wichtigste Währung.“
          </blockquote>
          <p className="mt-3 font-display font-semibold text-ink">— Ahmad, Gründer</p>
        </Reveal>
      </div>
    </section>
  );
}
