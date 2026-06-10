import { Star } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const testimonials = [
  {
    name: "Sarah Becker",
    role: "Geschäftsführerin, Becker Immobilien",
    initials: "SB",
    gradient: "from-blue-500 to-indigo-500",
    quote:
      "Unsere Website lädt jetzt in unter einer Sekunde und wir bekommen dreimal so viele Anfragen wie vorher. Die Zusammenarbeit war absolut professionell — klare Kommunikation, schnelle Umsetzung.",
  },
  {
    name: "Daniel Krüger",
    role: "Inhaber, Krüger & Partner Steuerberatung",
    initials: "DK",
    gradient: "from-cyan-500 to-blue-500",
    quote:
      "Der Security-Check hat Lücken aufgedeckt, von denen wir nichts wussten. Alles wurde sauber dokumentiert und behoben. Heute schlafe ich deutlich ruhiger — und unsere Mandanten auch.",
  },
  {
    name: "Melanie Hoffmann",
    role: "Marketing-Leiterin, FitOne Studios",
    initials: "MH",
    gradient: "from-emerald-500 to-teal-500",
    quote:
      "Nach dem Redesign und der SEO-Optimierung ranken wir für unsere wichtigsten Keywords auf Seite 1. Der Traffic hat sich verdoppelt, die Probemitgliedschaften sind um 60% gestiegen.",
  },
];

export default function Testimonials() {
  return (
    <section id="kunden" className="relative bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Kundenstimmen"
          title="Unternehmen, die uns vertrauen."
          subtitle="Echte Ergebnisse aus echten Projekten — das sagen Kunden über die Zusammenarbeit mit uns."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map(({ name, role, initials, gradient, quote }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <figure className="card flex h-full flex-col bg-white p-7">
                <div className="mb-4 flex gap-1" aria-label="5 von 5 Sternen">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">
                  „{quote}“
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5 border-t border-edge pt-5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-md`}
                    aria-hidden
                  >
                    {initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <p className="text-xs text-ink-muted">{role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
