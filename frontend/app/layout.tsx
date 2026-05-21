import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Norevan — Premium Streetwear, Sneaker & Accessoires",
    template: "%s · Norevan",
  },
  description: "Norevan — Premium Streetwear, Sneaker und Accessoires, kuratiert in Berlin. Handverlesene Mode aus aller Welt.",
  keywords: ["Norevan", "Norevan Shop", "Norevan Streetwear", "Premium Streetwear Berlin", "Sneaker Shop Berlin", "Limitierte Kollektionen"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan.shop"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
