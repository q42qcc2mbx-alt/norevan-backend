import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Norevan — Premium Streetwear",
    short_name: "Norevan",
    description: "Hand-picked sneakers, streetwear and accessories. Curated in Berlin.",
    start_url: "/de",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#15110d",
    orientation: "portrait-primary",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/logo/norevan.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/logo/norevan.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/logo/norevan.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
