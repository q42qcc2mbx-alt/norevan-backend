import type { Metadata } from "next";
import Solutions from "@/components/Solutions";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Lösungen — Website mieten, kaufen oder optimieren",
  description:
    "Drei Wege zu einer schnellen, sicheren und erfolgreichen Website: Optimierung Ihrer bestehenden Seite, ein Premium-Neubau zum Kauf oder ein Rundum-sorglos-Paket zur Miete (WaaS). Finden Sie die passende Option.",
  alternates: { canonical: "/loesungen" },
};

// Offer/price structured data so Google understands the three commercial paths.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "NOREVAN Digital — Website-Lösungen",
  itemListElement: [
    {
      "@type": "Offer",
      name: "Website optimieren",
      description: "Bestehende Website messbar schneller, sicherer und conversion-stärker.",
      priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR" },
    },
    {
      "@type": "Offer",
      name: "Website mieten (WaaS)",
      description: "Rundum-sorglos-Paket: Neubau, Hosting, Sicherheit, Wartung & Support monatlich.",
      priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR" },
    },
    {
      "@type": "Offer",
      name: "Website kaufen",
      description: "Maßgeschneiderter Premium-Neubau zum Eigentum.",
      priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR" },
    },
  ],
};

export default function LoesungenPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Solutions />
      <CtaBanner />
    </div>
  );
}
