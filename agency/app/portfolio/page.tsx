import type { Metadata } from "next";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import { features } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Ausgewählte Projekte mit messbaren Ergebnissen: Website-Relaunches, Performance-Optimierungen und Security-Audits für zufriedene Kunden.",
};

export default function PortfolioPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Portfolio />
      {/* Erst anzeigen, wenn echte, belegbare Kundenstimmen vorliegen
          (features.showTestimonials in lib/site.config.ts). */}
      {features.showTestimonials && <Testimonials />}
      <CtaBanner />
    </div>
  );
}
