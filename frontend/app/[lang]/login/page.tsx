import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LoginCard } from "@/components/auth/LoginCard";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "Anmelden — Norevan",
};

async function LoginContent({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const features =
    lang === "de"
      ? [
          ["Exklusive Drops", "Früher Zugang"],
          ["Kostenloser Versand", "Ab 120 €"],
          ["Echtheit garantiert", "Handgeprüft"],
          ["Kuratiert in Berlin", "Weltweit verschickt"],
        ]
      : [
          ["Exclusive drops", "Early access"],
          ["Free shipping", "Over €120"],
          ["Authenticity guaranteed", "Hand-verified"],
          ["Curated in Berlin", "Shipped worldwide"],
        ];

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--background)" }}
    >
      {/* Theme toggle — top right */}
      <div className="absolute right-5 top-5">
        <ThemeToggle label={lang === "de" ? "Design wechseln" : "Toggle theme"} />
      </div>

      {/* Back link — top left */}
      <div className="absolute left-5 top-5">
        <Link
          href={`/${lang}`}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40 transition-colors hover:text-foreground"
        >
          ← {lang === "de" ? "Zurück" : "Back"}
        </Link>
      </div>

      {/* Logo */}
      <Link href={`/${lang}`} className="mb-8 inline-block">
        <Image
          src="/logo/norevan-shield.png"
          alt="Norevan"
          width={72}
          height={72}
          className="h-18 w-18 object-contain"
          priority
          unoptimized
        />
      </Link>

      {/* Login card */}
      <LoginCard locale={lang} dict={dict} />

      {/* Small brand info box */}
      <div
        className="mt-8 w-full max-w-[360px] rounded-xl border px-5 py-4"
        style={{
          borderColor: "rgba(200,169,106,0.25)",
          background: "linear-gradient(135deg, #2a1c08cc 0%, #1c1206cc 100%)",
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {features.map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2">
              <span
                className="mt-[5px] h-px w-3 shrink-0"
                style={{ background: "#c8a96a", opacity: 0.7 }}
              />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#efd598]/85">
                  {title}
                </div>
                <div className="font-mono text-[8px] text-[#c8a96a]/55">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <Suspense
        fallback={<div className="min-h-screen" style={{ background: "var(--background)" }} />}
      >
        <LoginContent params={params} />
      </Suspense>
    </div>
  );
}
