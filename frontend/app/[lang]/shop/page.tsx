import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProducts, productsByBrand, isKnownBrand } from "@/lib/products";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ShopBrowser } from "@/components/product/CategoryFilter";
import { Reveal } from "@/components/motion/Reveal";
import { buildMetadata } from "@/lib/seo";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return buildMetadata({
    lang,
    path: "/shop",
    title:
      lang === "de"
        ? "Shop — alle Produkte | Norevan"
        : "Shop — all products | Norevan",
    description:
      lang === "de"
        ? "Hand-kuratierte Sneaker, Streetwear und Accessoires von Nike, Adidas, Polo Ralph Lauren und Ami Paris. Frei verschickt ab 100 €."
        : "Hand-curated sneakers, streetwear and accessories from Nike, Adidas, Polo Ralph Lauren and Ami Paris. Free shipping above €100.",
  });
}

async function ShopContent({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ brand?: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Reveal>
        <span className="eyebrow">{lang === "de" ? "Shop" : "Shop"}</span>
        <h1
          className="mt-4 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.6rem, 5vw, 4.25rem)",
            lineHeight: 1,
          }}
        >
          {lang === "de" ? (
            <>
              Alle <em>Produkte.</em>
            </>
          ) : (
            <>
              All <em>products.</em>
            </>
          )}
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted md:text-lg">
          {dict.categories.subtitle}
        </p>
      </Reveal>
      <div className="mt-12 md:mt-16" />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopBody lang={lang} dict={dict} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

export default function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ brand?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-24">
      <Suspense fallback={<ShopSkeleton />}>
        <ShopContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ShopBody({
  lang,
  dict,
  searchParams,
}: {
  lang: Locale;
  dict: Dictionary;
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: brandParam } = await searchParams;
  const brand = brandParam && isKnownBrand(brandParam) ? brandParam : null;
  const filtered = brand ? await productsByBrand(brand) : await getAllProducts();

  return (
    <ShopBrowser
      products={filtered}
      locale={lang}
      dict={dict}
      activeBrand={brand}
    />
  );
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/5] animate-pulse rounded-2xl bg-muted-bg"
        />
      ))}
    </div>
  );
}
