import { createServerClient } from "@supabase/ssr";
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

// Paths that are always accessible without a session
const OPEN_PREFIXES = ["/admin", "/api", "/_next"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Step 1: locale prefix redirect ─────────────────────────────────────────
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!hasLocale) {
    // Static assets and always-open paths pass through without locale
    if (OPEN_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const locale = pickLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // ── Step 2: auth gate ───────────────────────────────────────────────────────
  const lang =
    locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ??
    defaultLocale;

  // Login page and always-open paths are exempt
  const isLoginPage =
    pathname === `/${lang}/login` || pathname.startsWith(`/${lang}/login`);

  if (isLoginPage || OPEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Build mutable response so refreshed session cookies are forwarded to browser
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are not yet configured, let requests through (dev fallback only)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL(`/${lang}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"],
};
