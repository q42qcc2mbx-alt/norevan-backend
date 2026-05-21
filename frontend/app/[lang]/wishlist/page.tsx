import { Suspense } from "react";
import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { WishlistView } from "@/components/product/WishlistView";
import { Reveal } from "@/components/motion/Reveal";
import { buildMetadata } from "@/lib/seo";

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
    path: "/wishlist",
    title:
      lang === "de" ? "Wunschliste | Norevan" : "Wishlist | Norevan",
    description:
      lang === "de"
        ? "Deine gespeicherten Lieblingsprodukte."
        : "Your saved favourite products.",
  });
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-24">
      <Reveal>
        <span className="eyebrow">
          {lang === "de" ? "Gespeichert" : "Saved"}
        </span>
        <h1
          className="mt-4 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2.25rem, 5vw, 4.25rem)",
            lineHeight: 1,
          }}
        >
          {lang === "de" ? (
            <>
              Deine <em>Wunschliste.</em>
            </>
          ) : (
            <>
              Your <em>wishlist.</em>
            </>
          )}
        </h1>
      </Reveal>
      <div className="mt-12 md:mt-16">
        <Suspense fallback={<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-muted-bg" />)}</div>}>
          <WishlistView locale={lang} dict={dict} />
        </Suspense>
      </div>
    </div>
  );
}
