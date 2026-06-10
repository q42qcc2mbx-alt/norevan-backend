import { Gauge, ShieldCheck, Smile, Trophy } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import CountUp from "./ui/CountUp";

const stats = [
  {
    icon: Gauge,
    value: 90,
    suffix: "%",
    prefix: "bis zu ",
    label: "schnellere Ladezeiten",
    detail: "durch moderne Architektur, Caching und Bildoptimierung",
  },
  {
    icon: ShieldCheck,
    value: 100,
    suffix: "%",
    prefix: "",
    label: "verbesserte Sicherheit",
    detail: "alle kritischen Schutzmechanismen nach Best Practice",
  },
  {
    icon: Smile,
    value: 40,
    suffix: "+",
    prefix: "",
    label: "zufriedene Kunden",
    detail: "die uns weiterempfehlen und langfristig mit uns arbeiten",
  },
  {
    icon: Trophy,
    value: 75,
    suffix: "+",
    prefix: "",
    label: "erfolgreiche Projekte",
    detail: "von der Landingpage bis zur komplexen Plattform",
  },
];

export default function Stats() {
  return (
    <section id="ergebnisse" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Ergebnisse"
          title="Zahlen, die für sich sprechen."
          subtitle="Wir versprechen keine Wunder — wir liefern messbare Verbesserungen, die Sie in Ihren Analytics und auf Ihrem Konto sehen."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, suffix, prefix, label, detail }, i) => (
            <Reveal key={label} delay={i * 0.07}>
              <article className="card h-full p-7 text-center">
                <span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-4xl font-bold tracking-tight">
                  {prefix && (
                    <span className="text-base font-medium text-ink-muted">{prefix}</span>
                  )}
                  <span className="text-gradient">
                    <CountUp to={value} suffix={suffix} />
                  </span>
                </p>
                <h3 className="mt-2.5 text-base font-semibold text-ink">{label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
