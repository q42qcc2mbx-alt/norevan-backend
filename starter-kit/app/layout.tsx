import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website-Verbesserer",
  description: "Melde dich an und lass dir von der KI zeigen, wie du deine Website verbesserst.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
