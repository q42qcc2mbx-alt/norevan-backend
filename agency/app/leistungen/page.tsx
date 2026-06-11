import type { Metadata } from "next";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Process from "@/components/Process";
import Faq from "@/components/Faq";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Leistungen",
  description:
    "Website Entwicklung, Website Optimierung, Sicherheit & Performance, KI & Automatisierung — vier Kernleistungen, ein Ziel: Ihr Erfolg im Web.",
};

export default function LeistungenPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Services />
      <WhyUs />
      <Process />
      <Faq />
      <CtaBanner />
    </div>
  );
}
