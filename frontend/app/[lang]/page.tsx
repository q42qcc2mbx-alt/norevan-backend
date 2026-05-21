import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProducts, CATEGORIES, getHeroProduct } from "@/lib/products";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/ParallaxSection";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BrandStrip } from "@/components/layout/BrandStrip";
import { AnnouncementMarquee } from "@/components/layout/AnnouncementMarquee";
import { MetaballsHero } from "@/components/motion/MetaballsHero";
import { NewsletterSection } from "@/components/layout/NewsletterSection";
import { formatPrice } from "@/lib/format";
import { buildMetadata, organizationLd, websiteLd, JsonLd, SITE_TAGLINE } from "@/lib/seo";
import { MagneticLink } from "@/components/motion/MagneticButton";

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
    path: "",
    title:
      lang === "de"
        ? "Norevan — Premium Streetwear, Sneaker & Accessoires"
        : "Norevan — Premium streetwear, sneakers & accessories",
    description: SITE_TAGLINE[lang],
  });
}

async function HomeContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const hero = await getHeroProduct();
  const featured = (await getAllProducts())
    .filter((p) => p.highlight)
    .slice(0, 8);

  // Editorial mosaic: 1 large hero category + 5 standard
  const heroCategory = "streetwear" as const;
  const standardCategories = CATEGORIES.filter((c) => c !== heroCategory);

  return (
    <div className="flex flex-col">
      <JsonLd data={[organizationLd(), websiteLd(lang)]} />
      {/* Hero — interactive metaballs backdrop with editorial overlay */}
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-[#04030a] text-[#f3ede1]">
        <MetaballsHero />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#04030a]/85 via-[#04030a]/40 to-[#04030a]/30"
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-10 md:px-10 md:pb-24">
          <div className="max-w-2xl">
            <Reveal>
              <span className="text-[11px] uppercase tracking-[0.35em] text-white/60">
                {dict.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1
                className="headline mt-6 text-white"
                style={{ fontSize: "clamp(1.9rem, 7vw, 5.5rem)" }}
              >
                {lang === "de" ? (
                  <>
                    Streetwear <em>ohne Kompromisse.</em>
                  </>
                ) : (
                  <>
                    Streetwear, <em>no compromise.</em>
                  </>
                )}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-md text-base leading-[1.65] text-white/75">
                {dict.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <MagneticLink
                  href={`/${lang}/shop`}
                  className="gap-3 rounded-full bg-white px-7 py-3.5 text-[11px] uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-90"
                >
                  {dict.hero.cta}
                  <span aria-hidden>→</span>
                </MagneticLink>
                <Link
                  href={`/${lang}/lookbook`}
                  className="inline-flex items-center gap-3 rounded-full border border-white/40 px-7 py-3.5 text-[11px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
                >
                  Lookbook
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Bottom-right product credit */}
        {hero && (
          <div className="absolute bottom-6 right-6 hidden items-end gap-3 text-right text-white md:flex">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/55">
                Featured
              </div>
              <div className="mt-1 text-sm font-medium">{hero.name}</div>
              <div className="text-sm text-white/65">
                {formatPrice(hero.priceCents, lang)}
              </div>
            </div>
            <Link
              href={`/${lang}/shop/${hero.slug}`}
              aria-label={hero.name}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white hover:text-black"
            >
              →
            </Link>
          </div>
        )}

        <div className="absolute right-6 top-24 hidden text-right font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 md:block">
          {lang === "de" ? "Maus bewegen" : "Move cursor"}
        </div>
      </section>

      {/* Announcement marquee — wired below hero */}
      <AnnouncementMarquee locale={lang} />

      {/* Brands — quiet refined strip */}
      <BrandStrip
        locale={lang}
        title={dict.brands.title}
        subtitle={dict.brands.subtitle}
      />


      {/* Categories — full-bleed editorial wall, no padding bg between tiles */}
      <section id="categories" className="relative pt-12 md:pt-32">
        {/* Heading sits on its own, above the photo wall */}
        <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between gap-4 px-4 md:mb-12 md:px-10">
          <Reveal>
            <span className="eyebrow">
              {lang === "de" ? "Auswahl" : "Selection"}
            </span>
            <h2
              className="headline mt-3 md:mt-4"
              style={{ fontSize: "clamp(1.5rem, 4vw, 3.75rem)" }}
            >
              {lang === "de" ? (
                <>
                  Such dir was <em>du brauchst.</em>
                </>
              ) : (
                <>
                  Find what <em>you came for.</em>
                </>
              )}
            </h2>
          </Reveal>
          <span className="mono hidden text-muted md:inline-block">
            06 {lang === "de" ? "Kategorien" : "Categories"}
          </span>
        </div>

        {/* Edge-to-edge photo wall — tiles touch flush, no hairline gaps */}
        <div className="grid w-full grid-cols-2 gap-0 md:grid-cols-12">
          {/* Large hero tile spans 2 cols mobile, 6 cols + 2 rows desktop */}
          <Reveal className="col-span-2 md:col-span-6 md:row-span-2">
            <Link
              href={`/${lang}/shop?cat=${heroCategory}`}
              className="group relative block aspect-[4/5] h-full w-full overflow-hidden md:aspect-auto md:min-h-[720px]"
            >
              <Image
                src={`/categories/${heroCategory}.png`}
                alt={dict.categories[heroCategory]}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                priority
                unoptimized
              />
              {/* Subtle bottom gradient so label stays readable on any theme */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/65" />
              <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/55 md:left-8 md:top-8">
                01 / 06
              </div>
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-3 text-white md:inset-x-8 md:bottom-8">
                <div>
                  <span
                    className="block font-serif italic"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "clamp(1.75rem, 3vw, 3rem)",
                      lineHeight: 1,
                    }}
                  >
                    {dict.categories[heroCategory]}
                  </span>
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-white/75">
                    {lang === "de" ? "Hauptkollektion" : "Main collection"}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="pb-1 text-2xl transition-transform duration-500 group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </Link>
          </Reveal>

          {/* 5 standard tiles — same treatment, photos edge-to-edge */}
          {standardCategories.map((cat, i) => (
            <Reveal
              key={cat}
              delay={(i + 1) * 0.05}
              className="col-span-1 md:col-span-3"
            >
              <Link
                href={`/${lang}/shop?cat=${cat}`}
                className="group relative block aspect-[4/5] w-full overflow-hidden"
              >
                <Image
                  src={`/categories/${cat}.png`}
                  alt={dict.categories[cat]}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  unoptimized
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/65" />
                <div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/55 md:left-4 md:top-4">
                  0{i + 2} / 06
                </div>
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white md:inset-x-4 md:bottom-4">
                  <span className="text-sm font-medium tracking-wide drop-shadow">
                    {dict.categories[cat]}
                  </span>
                  <span
                    aria-hidden
                    className="text-base opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="border-t border-border-subtle bg-background-soft py-12 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4 md:mb-14">
              <div>
                <span className="eyebrow">Highlights</span>
                <h2
                  className="headline mt-3 md:mt-4"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 3.75rem)" }}
                >
                  {lang === "de" ? (
                    <>
                      Sorgfältig <em>kuratiert.</em>
                    </>
                  ) : (
                    <>
                      Carefully <em>curated.</em>
                    </>
                  )}
                </h2>
              </div>
              <Link
                href={`/${lang}/shop`}
                className="mono text-foreground underline-offset-4 hover:underline"
              >
                {dict.hero.cta} →
              </Link>
            </div>
          </Reveal>
          <ProductGrid
            products={featured}
            locale={lang}
            ctaLabel={dict.shop.addToCart}
            emptyLabel={dict.shop.empty}
          />
        </div>
      </section>

      {/* Editorial closer — full-bleed parallax photo with overlay text */}
      <section className="relative isolate min-h-[80vh] overflow-hidden bg-[#1a120a]">
        <Parallax offset={120} className="absolute inset-0">
          <div className="relative h-[110%] w-full">
            <Image
              src="/products/ralph-lauren-lifestyle-black-1.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-90"
              aria-hidden
            />
          </div>
        </Parallax>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a0604] via-[#0a0604]/55 to-[#0a0604]/35"
        />

        <div className="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-start justify-end px-6 pb-20 md:px-10 md:pb-32">
          <Reveal>
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#f3ede1]/70">
              {lang === "de" ? "Manufaktur" : "Atelier"}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-6 max-w-3xl text-balance font-serif italic text-[#f3ede1]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(2.25rem, 5vw, 4.75rem)",
                lineHeight: 1.05,
                fontWeight: 400,
              }}
            >
              {lang === "de"
                ? "Aus Berlin kuratiert, weltweit verschickt. Jedes Stück eine Geschichte."
                : "Curated in Berlin, shipped worldwide. Every piece tells a story."}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-base leading-[1.65] text-[#f3ede1]/75">
              {lang === "de"
                ? "Wir prüfen jedes Produkt auf Echtheit, Verarbeitung und Charakter — bevor es deine Tür erreicht."
                : "We verify every piece for authenticity, craftsmanship and character — before it reaches your door."}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <MagneticLink
              href={`/${lang}/shop`}
              className="mt-10 gap-3 rounded-full border border-[#f3ede1]/40 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#f3ede1] transition-colors hover:bg-[#f3ede1] hover:text-[#15110d]"
            >
              {dict.hero.cta}
              <span aria-hidden>→</span>
            </MagneticLink>
          </Reveal>
        </div>
      </section>

      {/* Newsletter — quiet ivory closer */}
      <NewsletterSection locale={lang} />
    </div>
  );
}

export default function LandingPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#04030a]" />}>
      <HomeContent params={params} />
    </Suspense>
  );
}
