"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  upsertProduct,
  deleteProduct as dbDeleteProduct,
  getProduct,
} from "@/lib/products";
import {
  isKnownBrand,
  CATEGORIES,
  type Brand,
  type Category,
  type Product,
  type ProductSpec,
} from "@/lib/products-types";
import { isAdminAuthed } from "@/lib/auth/admin";

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseImages(raw: string): { src: string; alt: string }[] {
  // accepts JSON array OR newline-separated `src | alt` pairs
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (
        Array.isArray(parsed) &&
        parsed.every((x) => typeof x?.src === "string")
      ) {
        return parsed.map((x) => ({
          src: String(x.src),
          alt: String(x.alt ?? ""),
        }));
      }
    } catch {
      // fall through
    }
  }
  return trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [src, alt] = line.split("|").map((s) => s.trim());
      return { src, alt: alt ?? "" };
    });
}

function parseSpecs(raw: string): ProductSpec[] {
  // accepts JSON OR newline-separated `label.de | label.en | value.de | value.en`
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as ProductSpec[];
    } catch {
      // fall through
    }
  }
  return trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((s) => s.trim());
      return {
        label: { de: parts[0] ?? "", en: parts[1] ?? parts[0] ?? "" },
        value: { de: parts[2] ?? "", en: parts[3] ?? parts[2] ?? "" },
      };
    });
}

function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildProduct(form: FormData, existingSlug?: string): Product {
  const rawName = String(form.get("name") ?? "").trim();
  if (!rawName) throw new Error("name_required");

  const slugInput = String(form.get("slug") ?? "").trim();
  const slug = slugify(slugInput || existingSlug || rawName);
  if (!slug) throw new Error("slug_required");

  const brandRaw = String(form.get("brand") ?? "generic");
  const brand: Brand = isKnownBrand(brandRaw)
    ? brandRaw
    : brandRaw === "generic"
      ? "generic"
      : "generic";

  const priceEuro = Number(String(form.get("price") ?? "0").replace(",", "."));
  if (!Number.isFinite(priceEuro) || priceEuro < 0) {
    throw new Error("invalid_price");
  }
  const priceCents = Math.round(priceEuro * 100);

  const categoriesRaw = form.getAll("categories").map(String);
  const categories: Category[] = categoriesRaw.filter((c): c is Category =>
    (CATEGORIES as readonly string[]).includes(c),
  );
  if (categories.length === 0) throw new Error("categories_required");

  const images = parseImages(String(form.get("images") ?? ""));
  if (images.length === 0 || !images[0]?.src) throw new Error("images_required");

  const sizesRaw = String(form.get("sizes") ?? "").trim();
  const sizes = sizesRaw ? parseList(sizesRaw) : undefined;

  const descriptionDe = String(form.get("description_de") ?? "").trim();
  const descriptionEn = String(form.get("description_en") ?? "").trim();
  if (!descriptionDe || !descriptionEn) throw new Error("description_required");

  const specs = parseSpecs(String(form.get("specs") ?? ""));

  const stockRaw = String(form.get("stock") ?? "0");
  const stock = Number.isFinite(Number(stockRaw)) ? Number(stockRaw) : 0;

  return {
    slug,
    name: rawName,
    brand,
    priceCents,
    categories,
    images,
    sizes,
    description: { de: descriptionDe, en: descriptionEn },
    specs,
    highlight: form.get("highlight") === "on",
    hero: form.get("hero") === "on",
    stock,
  };
}

async function requireAuth() {
  if (!(await isAdminAuthed())) {
    throw new Error("unauthorized");
  }
}

export async function createProductAction(form: FormData): Promise<void> {
  await requireAuth();
  const product = buildProduct(form);
  if (await getProduct(product.slug)) {
    throw new Error("slug_exists");
  }
  await upsertProduct(product);
  revalidatePath("/", "layout");
  redirect(`/admin/products`);
}

export async function updateProductAction(
  slug: string,
  form: FormData,
): Promise<void> {
  await requireAuth();
  const product = buildProduct(form, slug);
  // If slug changed, delete the old row first
  if (product.slug !== slug) {
    await dbDeleteProduct(slug);
  }
  await upsertProduct(product);
  revalidatePath("/", "layout");
  redirect(`/admin/products`);
}

export async function deleteProductAction(slug: string): Promise<void> {
  await requireAuth();
  await dbDeleteProduct(slug);
  revalidatePath("/", "layout");
  redirect(`/admin/products`);
}
