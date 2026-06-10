import {
  Palette,
  ShieldCheck,
  Rocket,
  Search,
  Bot,
  Workflow,
  LifeBuoy,
  Server,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const services = [
  {
    icon: Palette,
    title: "Website Redesign",
    text: "Modernes, markenstarkes Design, das Vertrauen aufbaut und verkauft.",
  },
  {
    icon: ShieldCheck,
    title: "Cyber Security Check",
    text: "Schwachstellen-Analyse, Härtung und Schutz vor gängigen Angriffen.",
  },
  {
    icon: Rocket,
    title: "Performance Optimierung",
    text: "Core Web Vitals im grünen Bereich — Ladezeiten, die begeistern.",
  },
  {
    icon: Search,
    title: "SEO Optimierung",
    text: "Technisches und inhaltliches SEO für nachhaltige Top-Rankings.",
  },
  {
    icon: Bot,
    title: "KI-Integration",
    text: "Chatbots, intelligente Suche und KI-Features, die echten Mehrwert liefern.",
  },
  {
    icon: Workflow,
    title: "Automatisierungen",
    text: "Wiederkehrende Abläufe automatisieren — von Leads bis Reporting.",
  },
  {
    icon: LifeBuoy,
    title: "Wartung & Support",
    text: "Updates, Monitoring und schnelle Hilfe — Ihre Website bleibt zuverlässig.",
  },
  {
    icon: Server,
    title: "Hosting-Beratung",
    text: "Das richtige Setup für Geschwindigkeit, Sicherheit und faire Kosten.",
  },
];

export default function Services() {
  return (
    <section id="leistungen" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Unsere Leistungen"
          title="Alles, was Ihre Website erfolgreich macht."
          subtitle="Von der ersten Analyse bis zum laufenden Betrieb — ein Partner für das gesamte digitale Fundament Ihres Unternehmens."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 4) * 0.07}>
              <article className="card-glow group h-full rounded-2xl p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-cyan-glow/10 text-accent-soft transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
