// Server-only product data layer. Calls the Express backend at `${API_URL}/api/v1/products`.
import "server-only";
import { api, ApiError } from "@/lib/api/client";
import type {
  Brand,
  Category,
  Product,
  ProductSpec,
} from "./products-types";
import {
  CATEGORIES,
  KNOWN_BRANDS,
  isKnownBrand,
  APPAREL_SIZES,
  SNEAKER_SIZES,
} from "./products-types";

export type { Brand, Category, Product, ProductSpec };
export { CATEGORIES, KNOWN_BRANDS, isKnownBrand, APPAREL_SIZES, SNEAKER_SIZES };

// ─── Read API ────────────────────────────────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  try {
    return await api.get<Product[]>("/products", {
      noAuth: true,
      next: { revalidate: 60, tags: ["products"] },
    });
  } catch (err) {
    console.warn("[products] getAllProducts failed:", (err as Error).message);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    return await api.get<Product>(`/products/${encodeURIComponent(slug)}`, {
      noAuth: true,
      next: { revalidate: 60, tags: ["products", `product:${slug}`] },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    console.warn("[products] getProduct failed:", (err as Error).message);
    return undefined;
  }
}

export async function productsByCategory(
  category?: Category,
): Promise<Product[]> {
  const all = await getAllProducts();
  if (!category) return all;
  return all.filter((p) => p.categories.includes(category));
}

export async function productsByBrand(
  brand?: Brand | null,
): Promise<Product[]> {
  const all = await getAllProducts();
  if (!brand) return all;
  return all.filter((p) => p.brand === brand);
}

export async function getHeroProduct(): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.hero) ?? all[0];
}

export async function relatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  const me = await getProduct(slug);
  if (!me) return [];
  const all = await getAllProducts();
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      product: p,
      score: p.categories.filter((c) => me.categories.includes(c)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.product);
}

/** "Kunden kauften auch" — products co-purchased in the same orders. */
export async function alsoBought(slug: string): Promise<Product[]> {
  try {
    return await api.get<Product[]>(
      `/products/${encodeURIComponent(slug)}/also-bought`,
      { noAuth: true, next: { revalidate: 300, tags: ["products"] } },
    );
  } catch (err) {
    console.warn("[products] alsoBought failed:", (err as Error).message);
    return [];
  }
}

// ─── Write API (admin actions call these via the backend) ────────────────
export async function upsertProduct(p: Product): Promise<Product> {
  // PUT is idempotent — backend will INSERT-OR-UPDATE by slug.
  return await api.put<Product>(
    `/products/${encodeURIComponent(p.slug)}`,
    p,
  );
}

export async function createProduct(p: Product): Promise<Product> {
  return await api.post<Product>("/products", p);
}

export async function deleteProduct(slug: string): Promise<void> {
  await api.delete<{ slug: string }>(`/products/${encodeURIComponent(slug)}`);
}
