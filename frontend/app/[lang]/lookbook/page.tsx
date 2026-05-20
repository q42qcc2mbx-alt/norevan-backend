import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/ParallaxSection";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
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
    path: "/lookbook",
    title:
      lang === "de"
        ? "Lookbook SS 2026 — eine Saison in vier Kapiteln | Norevan"
        : "Lookbook SS 2026 — one season in four chapters | Norevan",
    description:
      lang === "de"
        ? "Bilder aus dem Atelier — kuratiert, fotografiert und inszeniert in Berlin. Tech Fleece, Heritage, Sneaker, Atelier."
        : "Pictures from the atelier — curated, photographed and staged in Berlin. Tech Fleece, Heritage, Sneakers, Atelier.",
    image: "/products/ralph-lauren-lifestyle-black-1.jpg",
  });
}

type Spread = {
  layout: "wide" | "split" | "stack";
  title: string;
  subtitle: string;
  body: string;
  primary: string;
  secondary?: string;
  link?: { href: string; label: string };
};

export default async function LookbookPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const spreads: Spread[] = [
    {
      layout: "wide",
      title: lang === "de" ? "Tech Fleece Stories" : "Tech Fleece Stories",
      subtitle: lang === "de" ? "Kapitel 01" : "Chapter 01",
      body:
        lang === "de"
          ? "Das ikonische Set, neu inszeniert. Berlin-Beton, Tageslicht, kein Filter."
          : "The iconic set, restaged. Berlin concrete, daylight, no filter.",
      primary: "/products/nike-tech-fleece-grey-1.png",
      secondary: "/products/nike-tech-fleece-grey-2.jpg",
      link: { href: `/${lang}/shop/nike-tech-fleece-grey`, label: lang === "de" ? "Set ansehen" : "View set" },
    },
    {
      layout: "split",
      title: lang === "de" ? "Heritage / Modern" : "Heritage / Modern",
      subtitle: lang === "de" ? "Kapitel 02" : "Chapter 02",
      body:
        lang === "de"
          ? "Polo Ralph Lauren trifft auf Streetwear-Codes. Der klassische Pony, in einer neuen Sprache."
          : "Polo Ralph Lauren meets streetwear codes. The classic pony, in a new language.",
      primary: "/products/ralph-lauren-lifestyle-black-1.jpg",
      secondary: "/products/polo-ralph-lauren-sneaker-1.png",
      link: { href: `/${lang}/shop?brand=polo-ralph-lauren`, label: lang === "de" ? "Polo Ralph Lauren entdecken" : "Discover Polo Ralph Lauren" },
    },
    {
      layout: "stack",
      title: lang === "de" ? "Sneaker Stillleben" : "Sneaker Still Lifes",
      subtitle: lang === "de" ? "Kapitel 03" : "Chapter 03",
      body:
        lang === "de"
          ? "Drei Paare. Drei Charakterstudien. Material, Sohle, Linie."
          : "Three pairs. Three character studies. Material, sole, line.",
      primary: "/products/nike-street-sneaker-1.png",
      secondary: "/products/adidas-sneaker-1.png",
      link: { href: `/${lang}/shop?cat=sneaker`, label: lang === "de" ? "Sneaker ansehen" : "View sneakers" },
    },
    {
      layout: "wide",
      title: lang === "de" ? "Atelier Berlin" : "Atelier Berlin",
      subtitle: lang === "de" ? "Kapitel 04" : "Chapter 04",
      body:
        lang === "de"
          ? "Wir kuratieren in Berlin und versenden weltweit. Jedes Stück geprüft, jedes Stück signiert."
          : "We curate in Berlin and ship worldwide. Every piece checked, every piece signed.",
      primary: "/products/ami-paris-lifestyle-1.jpg",
      secondary: "/products/ami-paris-lifestyle-2.jpg",
      link: { href: `/${lang}/shop?brand=ami-paris`, label: lang === "de" ? "Ami Paris" : "Ami Paris" },
    },
  ];

  return (
    <div className="bg-background">
      {/* Lookbook hero */}
      <section className="relative isolate overflow-hidden bg-[#0a0604] pb-32 pt-32 text-[#f3ede1] md:pb-40 md:pt-44">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#f3ede1]/65">
              Lookbook · SS 2026
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="mt-6 max-w-4xl font-serif italic text-[#f3ede1]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(3rem, 8vw, 7rem)",
                lineHeight: 0.98,
                fontWeight: 400,
                letterSpacing: "-0.015em",
              }}
            >
              {lang === "de"
                ? "Eine Saison in vier Kapiteln."
                : "One season in four chapters."}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-[15px] leading-[1.65] text-[#f3ede1]/75">
              {lang === "de"
                ? "Bilder aus dem Atelier — kuratiert, fotografiert und inszeniert in Berlin."
                : "Pictures from the atelier — curated, photographed and staged in Berlin."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Spreads */}
      {spreads.map((spread, i) => (
        <Spread key={i} spread={spread} index={i} lang={lang} />
      ))}

      {/* Closing tile — back to shop */}
      <section className="border-t border-border-subtle bg-background py-32 md:py-40">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
          <Reveal>
            <span className="eyebrow">{lang === "de" ? "Ende des Lookbooks" : "End of lookbook"}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="headline-italic mt-6"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}
            >
              {lang === "de" ? "Zurück zum Atelier." : "Back to the atelier."}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href={`/${lang}/shop`}
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
            >
              {dict.shop.title}
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Spread({
  spread,
  index,
  lang,
}: {
  spread: Spread;
  index: number;
  lang: Locale;
}) {
  const isAlt = index % 2 === 1;
  const chapterNum = String(index + 1).padStart(2, "0");

  if (spread.layout === "wide") {
    return (
      <section
        className={`border-t border-border-subtle ${
          index === 0 ? "bg-background-soft" : "bg-background"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <header className="mb-10 flex items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
                  {chapterNum} · {spread.subtitle}
                </span>
                <h2
                  className="headline mt-3"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  {spread.title}
                </h2>
              </div>
              {spread.link && (
                <Link
                  href={spread.link.href}
                  className="hidden font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline md:inline-block"
                >
                  {spread.link.label} →
                </Link>
              )}
            </header>
          </Reveal>
          <Reveal>
            <Parallax offset={40}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-muted-bg">
                <Image
                  src={spread.primary}
                  alt={spread.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1280px"
                  className="object-cover"
                />
              </div>
            </Parallax>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            {spread.secondary && (
              <Reveal className="md:col-span-5">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted-bg">
                  <Image
                    src={spread.secondary}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            )}
            <Reveal delay={0.1} className="md:col-span-7 md:pt-12">
              <p className="body-soft max-w-md text-base leading-[1.65]">
                {spread.body}
              </p>
              {spread.link && (
                <Link
                  href={spread.link.href}
                  className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline md:hidden"
                >
                  {spread.link.label} →
                </Link>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    );
  }

  if (spread.layout === "split") {
    return (
      <section
        className={`border-t border-border-subtle ${
          isAlt ? "bg-background-soft" : "bg-background"
        }`}
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-24 md:grid-cols-2 md:gap-10 md:px-10 md:py-32">
          <Reveal className={isAlt ? "md:order-2" : ""}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted-bg">
              <Image
                src={spread.primary}
                alt={spread.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              {chapterNum} · {spread.subtitle}
            </span>
            <h2
              className="headline mt-4"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
            >
              {spread.title}
            </h2>
            <p className="body-soft mt-5 max-w-md text-base leading-[1.65]">
              {spread.body}
            </p>
            {spread.secondary && (
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-sm bg-muted-bg">
                <Image
                  src={spread.secondary}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            )}
            {spread.link && (
              <Link
                href={spread.link.href}
                className="mt-6 inline-flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
              >
                {spread.link.label} →
              </Link>
            )}
          </Reveal>
        </div>
      </section>
    );
  }

  // stack
  return (
    <section
      className={`border-t border-border-subtle ${
        isAlt ? "bg-background-soft" : "bg-background"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <header className="mb-10 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              {chapterNum} · {spread.subtitle}
            </span>
            <h2
              className="headline mt-3"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              {spread.title}
            </h2>
            <p className="body-soft mx-auto mt-5 max-w-md text-base leading-[1.65]">
              {spread.body}
            </p>
          </header>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted-bg">
              <Image
                src={spread.primary}
                alt={spread.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          {spread.secondary && (
            <Reveal delay={0.1} className="md:mt-16">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted-bg">
                <Image
                  src={spread.secondary}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
        </div>
        {spread.link && (
          <div className="mt-10 text-center">
            <Link
              href={spread.link.href}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              {spread.link.label} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
