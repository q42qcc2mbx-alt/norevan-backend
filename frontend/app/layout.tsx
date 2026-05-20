import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STRDX — Streetwear Shop",
  description: "Premium Streetwear, Sneakers & Accessoires.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
