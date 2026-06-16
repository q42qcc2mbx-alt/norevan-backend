import type { Metadata } from "next";
import MietPlans from "@/components/MietPlans";
import CtaBanner from "@/components/CtaBanner";
import { solutions } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Website mieten — Rundum-sorglos ab 99 €/Monat",
  description:
    "Profi-Website zur Miete: Bau, Hosting, EU-Server, SSL, Sicherheit, Backups, Wartung & Support inklusive — planbar monatlich, ohne große Investition. Drei Stufen: Starter, Business, Premium.",
  alternates: { canonical: "/mieten" },
};

// Product/Offer structured data for the three rental tiers.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Website mieten (WaaS) — NOREVAN Digital",
  description:
    "Rundum-sorglos-Website zur monatlichen Miete: Bau, Hosting, Sicherheit, Wartung und Support inklusive.",
  brand: { "@type": "Brand", name: "NOREVAN Digital" },
  offers: solutions.mieten.tiers.map((t) => ({
    "@type": "Offer",
    name: `Miete ${t.name}`,
    priceCurrency: "EUR",
    description: t.tagline,
  })),
};

export default function MietenPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MietPlans />
      <CtaBanner />
    </div>
  );
}
