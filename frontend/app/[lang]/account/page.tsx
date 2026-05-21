import { locales, type Locale } from "@/lib/i18n/config";
import { AccountView } from "@/components/auth/AccountView";
import { Reveal } from "@/components/motion/Reveal";
import type { Metadata } from "next";
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
    path: "/account",
    title: lang === "de" ? "Mein Konto | Norevan" : "My Account | Norevan",
    description:
      lang === "de"
        ? "Verwalte dein Norevan-Konto."
        : "Manage your Norevan account.",
  });
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
      <Reveal>
        <span className="eyebrow">
          {lang === "de" ? "Mitglieder" : "Members"}
        </span>
        <h1
          className="mt-4 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1,
          }}
        >
          {lang === "de" ? (
            <>
              Mein <em>Konto.</em>
            </>
          ) : (
            <>
              My <em>account.</em>
            </>
          )}
        </h1>
      </Reveal>
      <div className="mt-12">
        <AccountView locale={lang} />
      </div>
    </div>
  );
}
