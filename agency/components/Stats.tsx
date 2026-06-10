import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import CountUp from "./ui/CountUp";

const stats = [
  {
    value: 90,
    suffix: "%",
    prefix: "bis zu ",
    label: "schnellere Ladezeiten",
    detail: "durch moderne Architektur, Caching und Bildoptimierung",
  },
  {
    value: 100,
    suffix: "%",
    prefix: "",
    label: "Security-Härtung",
    detail: "alle kritischen Schutzmechanismen nach Best Practice",
  },
  {
    value: 3,
    suffix: "×",
    prefix: "bis zu ",
    label: "mehr Besucher durch SEO",
    detail: "nachhaltige Rankings statt teurer Dauer-Werbung",
  },
  {
    value: 40,
    suffix: "%",
    prefix: "Ø +",
    label: "bessere Nutzererfahrung",
    detail: "gemessen an Verweildauer und Conversion-Rate",
  },
];

export default function Stats() {
  return (
    <section id="ergebnisse" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Ergebnisse"
          title="Zahlen, die für sich sprechen."
          subtitle="Wir versprechen keine Wunder — wir liefern messbare Verbesserungen, die Sie in Ihren Analytics und auf Ihrem Konto sehen."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, suffix, prefix, label, detail }, i) => (
            <Reveal key={label} delay={i * 0.08}>
              <article className="card-glow h-full rounded-2xl p-7 text-center">
                <p className="text-4xl font-bold tracking-tight md:text-5xl">
                  <span className="text-base font-medium text-slate-400">
                    {prefix}
                  </span>
                  <span className="text-gradient">
                    <CountUp to={value} suffix={suffix} />
                  </span>
                </p>
                <h3 className="mt-3 text-base font-semibold text-white">{label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {detail}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
