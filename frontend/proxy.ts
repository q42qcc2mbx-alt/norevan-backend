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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|favicon\\.ico|.*\\..*).*)"],
};
