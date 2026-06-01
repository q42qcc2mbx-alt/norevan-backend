import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
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

  // Redirect to locale-prefixed URL if no locale present. (No session work
  // needed on a bare redirect — the target request runs through proxy again.)
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
