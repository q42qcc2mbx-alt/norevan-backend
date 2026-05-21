import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

function pickLocale(accept: string | null): string {
  if (!accept) return defaultLocale;
  const lower = accept.toLowerCase();
  for (const loc of locales) {
    if (
      lower.startsWith(loc) ||
      lower.includes(`,${loc}`) ||
      (lower.includes(`;q`) && lower.includes(loc))
    ) {
      return loc;
    }
  }
  return defaultLocale;
}

const OPEN_PREFIXES = ["/admin", "/api", "/_next"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect to locale-prefixed URL if no locale present
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!hasLocale) {
    if (OPEN_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const locale = pickLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"],
};
