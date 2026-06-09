// Pure types + constants — safe for client components.
// No DB / server imports here.

export const CATEGORIES = [
  "sneaker",
  "hosen-jeans",
  "accessoires",
  "schmuck",
  "herrenmode",
  "streetwear",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Brand =
  | "nike"
  | "adidas"
  | "polo-ralph-lauren"
  | "ami-paris"
  | "generic";

export type ProductSpec = {
  label: { de: string; en: string };
  value: { de: string; en: string };
};

export type Product = {
  slug: string;
  name: string;
  brand: Brand;
  priceCents: number;
  /** Purchase/cost price (net, cents) — back office only, for profit & margin. */
  costCents?: number;
  categories: Category[];
  images: { src: string; alt: string }[];
  sizes?: string[];
  description: { de: string; en: string };
  specs: ProductSpec[];
  highlight?: boolean;
  hero?: boolean;
  stock?: number;
  /** Per-size inventory map, e.g. { S: 3, M: 0, L: 5 }. When set it is the
   *  source of truth and `stock` is its sum; absent ⇒ aggregate stock only. */
  stockBySize?: Record<string, number>;
};

export const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
export const SNEAKER_SIZES = ["40", "41", "42", "43", "44", "45", "46"];

export const KNOWN_BRANDS: Brand[] = [
  "nike",
  "adidas",
  "polo-ralph-lauren",
  "ami-paris",
];

export function isKnownBrand(value: string): value is Brand {
  return (KNOWN_BRANDS as string[]).includes(value);
}
