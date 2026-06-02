import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://norevan.shop";
export const SITE_NAME = "Norevan";
export const SITE_TAGLINE: Record<Locale, string> = {
  de: "Premium Streetwear, Sneaker & Accessoires — kuratiert in Berlin.",
  en: "Premium streetwear, sneakers & accessories — curated in Berlin.",
};

const DEFAULT_OG = "/products/nike-tech-fleece-grey-1.png";

type BuildOptions = {
  lang: Locale;
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function buildMetadata({
  lang,
  title,
  description,
  path,
  image = DEFAULT_OG,
  type = "website",
  noIndex,
}: BuildOptions): Metadata {
  const url = `${SITE_URL}/${lang}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        de: `${SITE_URL}/de${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      locale: lang === "de" ? "de_DE" : "en_US",
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 1500, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

// ───────────────── JSON-LD builders ─────────────────

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ["Norevan Shop", "Norevan UG", "Norevan Streetwear"],
    url: SITE_URL,
    logo: `${SITE_URL}/logo/norevan-shield.png`,
    image: `${SITE_URL}/logo/norevan-shield.png`,
    description: "Norevan — Premium Streetwear, Sneaker und Accessoires, kuratiert in Berlin. Handverlesene Mode weltweit verschickt.",
    foundingDate: "2024",
    foundingLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Berlin", addressCountry: "DE" } },
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "hello@norevan.shop",
        contactType: "customer support",
        areaServed: ["DE", "AT", "CH"],
        availableLanguage: ["German", "English"],
      },
    ],
  };
}

export function websiteLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/${lang}`,
    inLanguage: lang === "de" ? "de-DE" : "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${lang}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productLd(
  product: Product,
  lang: Locale,
  rating?: { average: number; count: number },
) {
  const inStock = product.stock !== 0; // 0 = sold out, undefined = untracked
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description[lang],
    sku: product.slug,
    brand: { "@type": "Brand", name: product.brand.replace(/-/g, " ") },
    image: product.images.map((i) =>
      i.src.startsWith("http") ? i.src : `${SITE_URL}${i.src}`,
    ),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${lang}/shop/${product.slug}`,
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      priceValidUntil: "2027-12-31",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average.toFixed(1),
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    additionalProperty: product.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label[lang],
      value: s.value[lang],
    })),
    formattedPrice: formatPrice(product.priceCents, lang),
  };
}

export function breadcrumbLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function JsonLd({ data }: { data: object | object[] }) {
  const arr = Array.isArray(data) ? data : [data];
  return (
    <>
      {arr.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
