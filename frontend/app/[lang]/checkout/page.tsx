import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Reveal } from "@/components/motion/Reveal";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
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
    </div>
  );
}
