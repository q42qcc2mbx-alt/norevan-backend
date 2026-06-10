import {
  Gauge,
  ShieldCheck,
  Search,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const reasons = [
  {
    icon: Gauge,
    title: "Geschwindigkeit, die verkauft",
    text: "Jede Sekunde Ladezeit kostet bis zu 7% Conversion. Wir bringen Ihre Seite auf unter eine Sekunde — mit modernem Code, Caching und CDN.",
  },
  {
    icon: ShieldCheck,
    title: "Sicherheit ohne Kompromisse",
    text: "Wir finden und schließen Schwachstellen, bevor Angreifer sie ausnutzen — und schützen damit Ihre Daten und Ihren Ruf.",
  },
  {
    icon: Search,
    title: "Gefunden werden bei Google",
    text: "Technisches SEO, saubere Struktur und schnelle Seiten — damit Kunden Sie zuerst sehen und nicht die Konkurrenz.",
  },
  {
    icon: Sparkles,
    title: "Design, das Vertrauen schafft",
    text: "Klare, moderne Interfaces, die Besucher intuitiv ans Ziel führen — auf jedem Gerät, vom Smartphone bis zum Desktop.",
  },
  {
    icon: TrendingUp,
    title: "Mehr Anfragen, mehr Umsatz",
    text: "Durchdachte Call-to-Actions und datenbasierte Optimierung machen aus Besuchern zahlende Kunden.",
  },
  {
    icon: Wrench,
    title: "Technik, die einfach läuft",
    text: "Kaputte Links, Fehler, Darstellungsprobleme — wir beheben, was Ihre Website ausbremst, und halten sie dauerhaft stabil.",
  },
];

export default function WhyUs() {
  return (
    <section id="warum-wir" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Warum wir?"
          title="Ihre Website kann mehr — wir beweisen es."
          subtitle="Sechs Gründe, warum Unternehmen mit uns arbeiten, wenn ihre Website schneller laden, besser ranken und mehr verkaufen soll."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <article className="card h-full p-7">
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
