import type { Metadata } from "next";
import AnalyseSection from "@/components/AnalyseSection";
import AnalyseHeader from "@/components/AnalyseHeader";
import Aurora from "@/components/ui/Aurora";

export const metadata: Metadata = {
  title: "Kostenlose KI-Website-Analyse",
  description:
    "Lassen Sie Ihre Website in 30 Sekunden von unserer KI analysieren: Design, Geschwindigkeit, SEO, Mobile, Sicherheit, Benutzerfreundlichkeit, Conversion und Struktur — kostenlos.",
};

export default function AnalysePage() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <Aurora />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <AnalyseHeader />
        <AnalyseSection />
      </div>
    </section>
  );
}
