import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import DeviceChooser from "@/components/DeviceChooser";
import PwaRegister from "@/components/PwaRegister";
import CookieBanner from "@/components/CookieBanner";
import AppNavBar from "@/components/AppNavBar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

// Display typeface for headline branding (Hero, section titles, wordmark).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-raw",
  weight: ["500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan-agency.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NOREVAN Digital — Website-Entwicklung, Optimierung & Sicherheit",
    template: "%s | NOREVAN Digital",
  },
  description:
    "Wir machen Ihre Website schnell, sicher und erfolgreich. Website-Entwicklung, Performance-Optimierung, Security-Checks und KI-Integration — mit kostenloser KI-Analyse.",
  keywords: [
    "Website Entwicklung",
    "Website Optimierung",
    "Performance Optimierung",
    "Website Sicherheit",
    "SEO Optimierung",
    "Webagentur",
    "KI Website Analyse",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "NOREVAN Digital",
    title: "NOREVAN Digital — Schnelle, sichere & erfolgreiche Websites",
    description:
      "Mehr Geschwindigkeit. Mehr Sicherheit. Mehr Kunden. Kostenlose KI-Website-Analyse in 30 Sekunden.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOREVAN Digital — Website-Optimierung auf Premium-Niveau",
    description:
      "Entwicklung, Performance, Sicherheit und KI aus einer Hand. Kostenlose KI-Analyse Ihrer Website.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1d" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "NOREVAN Digital",
  url: siteUrl,
  description:
    "Agentur für Website-Entwicklung und -Optimierung: Performance, Sicherheit, SEO, KI-Integration und Wartung.",
  areaServed: "DE",
  priceRange: "€€€",
  serviceType: [
    "Website Entwicklung",
    "Website Optimierung",
    "Sicherheit & Performance",
    "KI & Automatisierung",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-page font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <I18nProvider>
            <Navbar />
            <main className="min-h-[60dvh]">{children}</main>
            <Footer />
            <ChatWidget />
            <DeviceChooser />
            <PwaRegister />
            <CookieBanner />
            <AppNavBar />
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
