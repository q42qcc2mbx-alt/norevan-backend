import { ArrowRight, Bot, Code2, Rocket, ShieldCheck } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const services = [
  {
    icon: Code2,
    title: "Website Entwicklung",
    text: "Moderne, blitzschnelle Websites mit Next.js und React — vom Konzept über das Design bis zum Launch. Mobile-First, barrierearm und auf Conversion ausgelegt.",
    points: ["Individuelles Design", "CMS nach Wahl", "Launch in 4–8 Wochen"],
  },
  {
    icon: Rocket,
    title: "Website Optimierung",
    text: "Wir analysieren Ihre bestehende Website und holen messbar mehr heraus: kürzere Ladezeiten, bessere Rankings, höhere Conversion-Rate.",
    points: ["Core Web Vitals im grünen Bereich", "Technisches SEO", "Vorher-Nachher-Report"],
  },
  {
    icon: ShieldCheck,
    title: "Sicherheit & Performance",
    text: "Security-Audit, Härtung und laufendes Monitoring — kombiniert mit Caching, CDN und Hosting-Beratung für maximale Stabilität.",
    points: ["Schwachstellen-Analyse", "Backups & Monitoring", "DSGVO-Check"],
  },
  {
    icon: Bot,
    title: "KI & Automatisierung",
    text: "Intelligente Chatbots, automatisierte Abläufe und KI-Features, die Zeit sparen und echten Mehrwert für Ihre Kunden schaffen.",
    points: ["KI-Chatbots & Suche", "Workflow-Automatisierung", "Individuelle Integrationen"],
  },
];

export default function Services() {
  return (
    <section id="leistungen" className="relative bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Leistungen"
          title="Vier Leistungen. Ein Ziel: Ihr Erfolg im Web."
          subtitle="Klar fokussiert statt beliebig — wir konzentrieren uns auf das, was Ihre Website wirklich voranbringt."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {services.map(({ icon: Icon, title, text, points }, i) => (
            <Reveal key={title} delay={(i % 2) * 0.08}>
              <article className="card group h-full bg-white p-7 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow text-white shadow-md shadow-accent/25 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-ink md:text-xl">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2 border-t border-edge pt-5">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-sm text-ink-soft">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  href="#kontakt"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
                >
                  Unverbindlich anfragen
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
