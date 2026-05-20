import Link from "next/link";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LoginCard } from "@/components/auth/LoginCard";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: "Sign in — Norevan",
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      {/* Voronoi splash background */}
      <iframe
        src="/wallpapers/02-voronoi.html"
        className="absolute inset-0 h-full w-full border-0"
        title="splash"
        aria-hidden="true"
      />

      {/* Top bar with brand + close */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href={`/${lang}`}
          className="font-serif text-2xl tracking-tight text-white"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Nor<em className="not-italic" style={{ color: "var(--gold)" }}>e</em>van
        </Link>
        <Link
          href={`/${lang}`}
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white transition-colors hover:bg-white hover:text-black"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>

      {/* Centered card */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <LoginCard locale={lang} dict={dict} />
      </div>

      {/* Bottom hint */}
      <div className="absolute inset-x-0 bottom-6 z-10 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        Click the canvas — pin a sonar seed.
      </div>
    </div>
  );
}
