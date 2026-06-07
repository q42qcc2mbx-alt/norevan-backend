import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";

// Country codes whose visitors get the German storefront; everyone else gets
// English. (DE Germany · AT Austria · CH Switzerland · LI Liechtenstein.)
const GERMAN_SPEAKING = new Set(["DE", "AT", "CH", "LI"]);
const LOCALE_COOKIE = "NEXT_LOCALE";

function fromAcceptLanguage(accept: string | null): Locale | null {
  if (!accept) return null;
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
  return null;
}

/**
 * Resolve the locale for a locale-less request:
 *  1. A manual choice (NEXT_LOCALE cookie, set by the language switcher) wins.
 *  2. Otherwise geolocation: German-speaking country → de, else en.
 *  3. Fallbacks (no geo header, e.g. local dev): Accept-Language, then default.
 */
function resolveLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) {
    return cookie as Locale;
  }

  // Vercel injects the visitor's country here at the edge.
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (country) return GERMAN_SPEAKING.has(country) ? "de" : "en";

  // No geo signal (local dev / non-Vercel host) — fall back to the browser.
  return fromAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale;
}

// `/auth` holds the Supabase OAuth callback (app/auth/callback) which must NOT
// be locale-prefixed, or the OAuth redirect 404s.
const OPEN_PREFIXES = ["/admin", "/api", "/auth", "/_next"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect to locale-prefixed URL if no locale present. (No session work
  // needed on a bare redirect — the target request runs through proxy again.)
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!hasLocale) {
    if (OPEN_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const locale = resolveLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const redirect = NextResponse.redirect(url);
    // Remember the resolved locale so deeper navigation stays consistent and
    // a later geo lookup doesn't override it.
    redirect.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return redirect;
  }

  // Refresh the Supabase auth session so its access token stays valid and the
  // session cookies persist for server components / route handlers (checkout,
  // order history). This is the canonical @supabase/ssr middleware pattern.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"],
};
