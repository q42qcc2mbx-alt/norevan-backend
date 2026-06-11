import { ClipboardCheck, MessagesSquare, Rocket, Wrench } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const steps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Kostenlose Analyse",
    text: "Wir prüfen Ihre Website auf Performance, Sicherheit und SEO — und zeigen Ihnen klar, wo Potenzial liegt.",
  },
  {
    icon: MessagesSquare,
    step: "02",
    title: "Konzept & Angebot",
    text: "Im persönlichen Gespräch definieren wir Ziele und Umfang. Sie erhalten ein transparentes Festpreis-Angebot.",
  },
  {
    icon: Wrench,
    step: "03",
    title: "Umsetzung",
    text: "Wir arbeiten auf einer Staging-Umgebung — Ihre Website bleibt online. Sie sehen den Fortschritt jederzeit.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Launch & Betreuung",
    text: "Nach gründlichen Tests geht alles live. Auf Wunsch übernehmen wir Wartung, Updates und Monitoring.",
  },
];

export default function Process() {
  return (
    <section id="ablauf" className="relative bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Ablauf"
          title="In vier Schritten zur besseren Website."
          subtitle="Klar strukturiert, transparent und ohne Überraschungen — so läuft die Zusammenarbeit mit uns ab."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, text }, i) => (
            <Reveal key={step} delay={i * 0.08}>
              <article className="card-surface relative h-full p-7">
                <span className="absolute top-6 right-6 text-3xl font-bold text-edge select-none">
                  {step}
                </span>
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
