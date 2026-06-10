import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, relatedProducts, alsoBought } from "@/lib/products";
import { getReviews } from "@/lib/reviews";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Reveal } from "@/components/motion/Reveal";
import { buildMetadata, productLd, breadcrumbLd, JsonLd, SITE_URL } from "@/lib/seo";

export async function generateStaticParams() {
  const { getAllProducts } = await import("@/lib/products");
  const products = await getAllProducts();
  // If backend unreachable at build time, fall back to a placeholder so
  // cacheComponents validation passes; dynamicParams=true handles real slugs.
  if (products.length === 0) {
    return locales.map((lang) => ({ lang, slug: "_placeholder" }));
  }
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return buildMetadata({
    lang,
    path: `/shop/${slug}`,
    title: `${product.name} — Norevan`,
    description: product.description[lang],
    image: product.images[0]?.src,
    type: "article",
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await relatedProducts(slug, 4);
  const coBought = await alsoBought(slug);
  const reviews = await getReviews(slug);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:py-14">
      <JsonLd
        data={[
          productLd(product, lang, { average: reviews.average, count: reviews.count }),
          breadcrumbLd([
            { name: lang === "de" ? "Start" : "Home", url: `${SITE_URL}/${lang}` },
            { name: lang === "de" ? "Shop" : "Shop", url: `${SITE_URL}/${lang}/shop` },
            { name: product.name, url: `${SITE_URL}/${lang}/shop/${product.slug}` },
          ]),
        ]}
      />
      <ProductDetailView product={product} locale={lang} dict={dict} reviews={reviews} />

      {coBought.length > 0 && (
        <section className="mt-24 border-t border-border-subtle pt-16 md:mt-32 md:pt-20">
          <Reveal>
            <span className="eyebrow">{lang === "de" ? "Beliebt zusammen" : "Often together"}</span>
            <h2
              className="mt-4 mb-10 font-serif"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                lineHeight: 1.05,
              }}
            >
              {lang === "de" ? (
                <>
                  Kunden kauften <em>auch.</em>
                </>
              ) : (
                <>
                  Customers also <em>bought.</em>
                </>
              )}
            </h2>
          </Reveal>
          <ProductGrid
            products={coBought}
            locale={lang}
            ctaLabel={dict.shop.addToCart}
            emptyLabel={dict.shop.empty}
          />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24 border-t border-border-subtle pt-16 md:mt-32 md:pt-20">
          <Reveal>
            <span className="eyebrow">{lang === "de" ? "Weiter stöbern" : "Keep browsing"}</span>
            <h2
              className="mt-4 mb-10 font-serif"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                lineHeight: 1.05,
              }}
            >
              {lang === "de" ? (
                <>
                  Das könnte dir <em>auch gefallen.</em>
                </>
              ) : (
                <>
                  You might <em>also like.</em>
                </>
              )}
            </h2>
          </Reveal>
          <ProductGrid
            products={related}
            locale={lang}
            ctaLabel={dict.shop.addToCart}
            emptyLabel={dict.shop.empty}
          />
        </section>
      )}

      <RecentlyViewed
        locale={lang}
        current={{
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.src ?? "",
          priceCents: product.priceCents,
          brand: product.brand,
        }}
      />
    </div>
  );
}
