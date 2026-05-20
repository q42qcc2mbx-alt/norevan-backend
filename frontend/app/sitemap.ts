import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { locales } from "@/lib/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan.shop";
const LAST_MOD = new Date("2026-05-06");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/shop", "/lookbook", "/cart", "/checkout", "/login"];
  const legalPaths = ["/legal/impressum", "/legal/agb", "/legal/datenschutz", "/legal/widerruf"];

  const entries: MetadataRoute.Sitemap = [];
  const products = await getAllProducts();

  for (const lang of locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${lang}${p}`,
        lastModified: LAST_MOD,
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 1 : 0.7,
      });
    }
    for (const p of legalPaths) {
      entries.push({
        url: `${SITE_URL}/${lang}${p}`,
        lastModified: LAST_MOD,
        changeFrequency: "yearly",
        priority: 0.2,
      });
    }
    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/${lang}/shop/${product.slug}`,
        lastModified: LAST_MOD,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
