import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan.digital";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "NOREVAN Digital — Website-Optimierung, Performance & Sicherheit",
    template: "%s | NOREVAN Digital",
  },
  description:
    "Wir verwandeln Ihre Website in eine schnelle, sichere und leistungsstarke Plattform. Performance-Optimierung, Security-Checks, SEO und modernes Redesign — mit kostenloser KI-Analyse.",
  keywords: [
    "Website Optimierung",
    "Performance Optimierung",
    "Website Sicherheit",
    "SEO Optimierung",
    "Website Redesign",
    "Webagentur",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "NOREVAN Digital",
    title: "NOREVAN Digital — Schnelle, sichere & leistungsstarke Websites",
    description:
      "Mehr Geschwindigkeit. Mehr Sicherheit. Mehr Kunden. Fordern Sie jetzt Ihre kostenlose KI-Website-Analyse an.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOREVAN Digital — Website-Optimierung auf Premium-Niveau",
    description:
      "Performance, Sicherheit, SEO und Redesign aus einer Hand. Kostenlose KI-Analyse Ihrer Website.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "NOREVAN Digital",
  url: siteUrl,
  description:
    "Agentur für Website-Optimierung: Performance, Sicherheit, SEO, Redesign, KI-Integration und Wartung.",
  areaServed: "DE",
  priceRange: "€€€",
  serviceType: [
    "Website Redesign",
    "Performance Optimierung",
    "Cyber Security Check",
    "SEO Optimierung",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-dvh bg-night font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
