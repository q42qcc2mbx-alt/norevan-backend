import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Norevan · Admin",
  robots: { index: false, follow: false },
};

// App-like behaviour: cover the safe area and stop iOS Safari from auto-zooming
// on input focus / pinch (keeps the back office steady like a native app).
export const viewport: Viewport = {
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#15110d" },
  ],
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {/* Back office defaults to dark (its original look) but can switch to a
            light "hell" mode; the choice persists across the whole site. */}
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
