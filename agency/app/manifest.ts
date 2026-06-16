import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOREVAN Digital",
    short_name: "NOREVAN",
    description:
      "Website-Entwicklung & -Optimierung: schnell, sicher, erfolgreich — mit kostenloser KI-Analyse.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#a22a2a",
    lang: "de",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
