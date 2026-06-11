import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan-agency.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/leistungen", "/analyse", "/portfolio", "/ueber-uns", "/kontakt"];
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
