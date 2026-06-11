import type { Metadata } from "next";
import { Code2, Palette, ShieldCheck, TrendingUp } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Stats from "@/components/Stats";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Über Uns",
  description:
    "Das Team hinter NOREVAN Digital: vier Spezialisten für Entwicklung, Design, Sicherheit und Wachstum — mit einem Ziel: Websites, die liefern.",
};

const team = [
  {
    name: "Ahmad",
    role: "Gründer & Full-Stack Entwickler",
    icon: Code2,
    gradient: "from-blue-500 to-indigo-500",
    initials: "A",
    text: "Verantwortet Architektur und Entwicklung — von der ersten Zeile Code bis zum Launch. Sein Anspruch: Websites, die in unter einer Sekunde laden.",
  },
  {
    name: "Mohammad",
    role: "UI/UX Design & Conversion",
    icon: Palette,
    gradient: "from-cyan-500 to-blue-500",
    initials: "M",
    text: "Gestaltet Interfaces, die Vertrauen schaffen und Besucher intuitiv ans Ziel führen — modern, klar und auf Conversion ausgelegt.",
  },
  {
    name: "Mazen",
    role: "Sicherheit & Performance",
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-teal-500",
    initials: "M",
    text: "Findet Schwachstellen, bevor Angreifer es tun. Härtet Websites nach Best Practice und sorgt mit Monitoring für ruhigen Schlaf.",
  },
  {
    name: "Abdulghani",
    role: "SEO & Wachstum",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-500",
    initials: "A",
    text: "Bringt Websites bei Google nach vorn — mit technischem SEO, sauberer Struktur und datenbasierter Optimierung für nachhaltiges Wachstum.",
  },
];

const values = [
  {
    title: "Messbar statt schön geredet",
    text: "Jedes Projekt startet mit einer Ist-Messung und endet mit einem Vorher-Nachher-Report. Ergebnisse, die Sie in Ihren Zahlen sehen.",
  },
  {
    title: "Ehrliche Beratung",
    text: "Wir empfehlen nur, was Ihrem Ziel wirklich dient — auch wenn das mal die kleinere Lösung ist. Vertrauen ist unsere wichtigste Währung.",
  },
  {
    title: "Technologie mit Substanz",
    text: "Moderne Tools wie Next.js, React und KI setzen wir gezielt ein — nicht weil sie trendy sind, sondern weil sie schneller, sicherer und wartbarer sind.",
  },
];

export default function UeberUnsPage() {
  return (
    <div className="pt-16 md:pt-20">
      <section className="relative py-20 md:py-28">
        <div className="hero-glow absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Über Uns"
            title="Vier Spezialisten. Ein Ziel: Websites, die liefern."
            subtitle="NOREVAN Digital vereint Entwicklung, Design, Sicherheit und Wachstum unter einem Dach — damit Sie einen Ansprechpartner für alles haben."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(({ name, role, icon: Icon, gradient, initials, text }, i) => (
              <Reveal key={name} delay={i * 0.08}>
                <article className="card h-full p-7 text-center">
                  <span
                    className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-lg`}
                    aria-hidden
                  >
                    {initials}
                  </span>
                  <h2 className="text-lg font-semibold text-ink">{name}</h2>
                  <p className="mt-0.5 flex items-center justify-center gap-1.5 text-sm font-medium text-accent">
                    <Icon className="h-4 w-4" />
                    {role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Unsere Werte"
            title="Wofür wir stehen."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <article className="card-surface h-full p-7">
                  <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Stats />
      <CtaBanner />
    </div>
  );
}
