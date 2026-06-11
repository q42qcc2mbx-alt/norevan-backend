import type { Metadata } from "next";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Erzählen Sie uns von Ihrem Projekt — Sie erhalten innerhalb von 24 Stunden eine persönliche Antwort mit konkreten nächsten Schritten.",
};

export default function KontaktPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Contact />
    </div>
  );
}
