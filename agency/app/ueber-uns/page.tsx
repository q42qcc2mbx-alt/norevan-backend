import type { Metadata } from "next";
import { Code2, Palette, ShieldCheck, TrendingUp } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Aurora from "@/components/ui/Aurora";
import Stats from "@/components/Stats";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Über Uns",
  description:
    "Das Team hinter NOREVAN Digital: vier Spezialisten für Entwicklung, Design, Sicherheit und Wachstum — mit einem Ziel: Websites, die liefern.",
};

const team = [
  {
    role: "Entwicklung & Architektur",
    icon: Code2,
    gradient: "from-blue-500 to-indigo-500",
    text: "Verantwortet Architektur und Entwicklung — von der ersten Zeile Code bis zum Launch. Der Anspruch: Websites, die in unter einer Sekunde laden.",
  },
  {
    role: "Design & Conversion",
    icon: Palette,
    gradient: "from-cyan-500 to-blue-500",
    text: "Gestaltet Interfaces, die Vertrauen schaffen und Besucher intuitiv ans Ziel führen — modern, klar und auf Conversion ausgelegt.",
  },
  {
    role: "Sicherheit & Performance",
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-teal-500",
    text: "Findet Schwachstellen, bevor Angreifer es tun. Härtet Websites nach Best Practice und sorgt mit Monitoring für ruhigen Schlaf.",
  },
  {
    role: "SEO & Wachstum",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-500",
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
        <Aurora />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Über Uns"
            title="Vier Spezialisten. Ein Ziel: Websites, die liefern."
            subtitle="NOREVAN Digital vereint Entwicklung, Design, Sicherheit und Wachstum unter einem Dach — damit Sie einen Ansprechpartner für alles haben."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(({ role, icon: Icon, gradient, text }, i) => (
              <Reveal key={role} delay={i * 0.08}>
                <article className="card h-full p-7 text-center">
                  <span
                    className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg`}
                    aria-hidden
                  >
                    <Icon className="h-9 w-9" />
                  </span>
                  <h2 className="text-lg font-semibold text-ink">{role}</h2>
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
