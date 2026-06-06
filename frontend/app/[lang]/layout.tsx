import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { WelcomeGate } from "@/components/layout/WelcomeGate";
import { DeviceProvider } from "@/components/device/DeviceProvider";
import { DeviceChooser } from "@/components/device/DeviceChooser";
import { AppNavBar } from "@/components/device/AppNavBar";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAllProducts } from "@/lib/products";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

async function HeaderWithProducts({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const products = await getAllProducts();
  return <Header locale={locale} dict={dict} products={products} />;
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan.shop"),
  title: {
    default: "Norevan — Premium Streetwear",
    template: "%s · Norevan",
  },
  description: "Hand-picked sneakers, streetwear and accessories. Curated in Berlin.",
  applicationName: "Norevan",
  authors: [{ name: "Norevan UG" }],
  creator: "Norevan",
  publisher: "Norevan",
  formatDetection: { email: false, address: false, telephone: false },
};

// viewport-fit=cover lets App Mode use the iOS safe-area insets (notch / home
// indicator) so the bottom tab bar sits flush like a native app.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#15110d" },
  ],
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-3 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.25em] focus:text-background"
        >
          {locale === "de" ? "Zum Inhalt springen" : "Skip to content"}
        </a>
        <ThemeProvider>
          <LenisProvider>
            <ScrollProgress />
            <div className="relative flex min-h-screen flex-col">
              <Suspense fallback={<div className="h-16 border-b border-border-subtle" />}>
                <HeaderWithProducts locale={locale} dict={dict} />
              </Suspense>
              <div id="main-content">
                <PageTransition>{children}</PageTransition>
              </div>
              <Footer dict={dict} locale={locale} />
            </div>
            <CartDrawer locale={locale} dict={dict} />
            <GrainOverlay />
            <PageViewTracker />
            <CookieConsent locale={locale} />
            <WelcomeGate locale={locale} />
            <DeviceProvider />
            <DeviceChooser locale={locale} />
            <AppNavBar locale={locale} />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
