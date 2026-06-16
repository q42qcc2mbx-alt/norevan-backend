import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan-agency.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/loesungen", "/mieten", "/leistungen", "/analyse", "/anfrage", "/portfolio", "/ueber-uns", "/kontakt"];
  const legalRoutes = ["/impressum", "/datenschutz", "/agb"];
  return [
    ...routes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...legalRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
