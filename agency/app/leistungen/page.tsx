import type { Metadata } from "next";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Process from "@/components/Process";
import Faq from "@/components/Faq";
import CtaBanner from "@/components/CtaBanner";
import { de } from "@/lib/translations";

export const metadata: Metadata = {
  title: "Leistungen",
  description:
    "Website Entwicklung, Website Optimierung, Sicherheit & Performance, KI & Automatisierung — vier Kernleistungen, ein Ziel: Ihr Erfolg im Web.",
};

// FAQPage structured data → Google can show our FAQ as a rich snippet.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: de.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function LeistungenPage() {
  return (
    <div className="pt-16 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Services />
      <WhyUs />
      <Process />
      <Faq />
      <CtaBanner />
    </div>
  );
}
