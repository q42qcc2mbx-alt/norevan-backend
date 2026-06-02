import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/de";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sign-in email for real (non-guest) accounts. The backend returns 204
      // immediately and sends in the background, so this won't slow the redirect.
      const token = data.session?.access_token;
      if (token && !data.session?.user?.is_anonymous) {
        try {
          await api.post("/account/login-notify", undefined, { token });
        } catch {
          // best-effort
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/de/login?error=auth`);
}
