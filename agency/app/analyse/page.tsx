import type { Metadata } from "next";
import { Gauge, Lock, ScanSearch, Smartphone } from "lucide-react";
import AnalyseSection from "@/components/AnalyseSection";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Kostenlose KI-Website-Analyse",
  description:
    "Lassen Sie Ihre Website in 30 Sekunden von unserer KI analysieren: Design, Geschwindigkeit, SEO, Mobile, Sicherheit, Benutzerfreundlichkeit, Conversion und Struktur — kostenlos.",
};

const checks = [
  { icon: Gauge, label: "Geschwindigkeit & Performance" },
  { icon: Lock, label: "Sicherheit & SSL" },
  { icon: ScanSearch, label: "SEO & Struktur" },
  { icon: Smartphone, label: "Mobile & Benutzerfreundlichkeit" },
];

export default function AnalysePage() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase">
            KI Website Analyse
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-balance text-ink md:text-5xl">
            Was bremst Ihre Website?{" "}
            <span className="text-gradient">Die KI findet es heraus.</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">
            Link eingeben, Ziel beschreiben — und in etwa 30 Sekunden erhalten
            Sie eine professionelle Analyse mit Problemen, Verbesserungen und
            klaren Prioritäten.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {checks.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
                <Icon className="h-4 w-4 text-accent" />
                {label}
              </span>
            ))}
          </div>
        </Reveal>

        <AnalyseSection />
      </div>
    </section>
  );
}
