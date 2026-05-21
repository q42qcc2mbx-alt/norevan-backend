import { Suspense } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CartView } from "@/components/cart/CartView";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

async function CartContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Reveal>
        <span className="eyebrow">
          {lang === "de" ? "Warenkorb" : "Bag"}
        </span>
        <h1
          className="mt-4 mb-12 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1,
          }}
        >
          {lang === "de" ? (
            <>
              Dein <em>Warenkorb.</em>
            </>
          ) : (
            <>
              Your <em>bag.</em>
            </>
          )}
        </h1>
      </Reveal>
      <CartView locale={lang} dict={dict} />
    </>
  );
}

export default function CartPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-24">
      <Suspense fallback={<div className="animate-pulse h-64 rounded-2xl bg-muted-bg" />}>
        <CartContent params={params} />
      </Suspense>
    </div>
  );
}
