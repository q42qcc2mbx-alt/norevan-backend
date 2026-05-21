import { Suspense } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

async function CheckoutContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Reveal>
        <span className="eyebrow">
          {lang === "de" ? "Kasse" : "Checkout"}
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
              Bestellung <em>abschließen.</em>
            </>
          ) : (
            <>
              Complete <em>your order.</em>
            </>
          )}
        </h1>
      </Reveal>
      <CheckoutForm locale={lang} dict={dict} />
    </>
  );
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
      <Suspense fallback={<div className="animate-pulse h-64 rounded-2xl bg-muted-bg" />}>
        <CheckoutContent params={params} />
      </Suspense>
    </div>
  );
}
