import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { API_BASE_URL, AUTH_COOKIE } from "@/lib/api/client";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (must be ≤ JWT expiry)

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing_fields");
  }

  // Call backend
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  type LoginBody = {
    status: "success" | "error";
    message?: string;
    data?: { token: string };
  };
  const body = (await res.json()) as LoginBody;

  if (!res.ok || body.status !== "success" || !body.data?.token) {
    const msg = body.message ?? "login_failed";
    redirect(`/admin/login?error=${encodeURIComponent(msg)}`);
  }

  // Verify the user is actually an admin before storing the cookie.
  const dashRes = await fetch(`${API_BASE_URL}/api/v1/dashboard`, {
    headers: { Authorization: `Bearer ${body.data!.token}` },
    cache: "no-store",
  });
  const dash = (await dashRes.json()) as {
    data?: { user?: { is_admin?: number } };
  };
  if (!dashRes.ok || !dash?.data?.user?.is_admin) {
    redirect("/admin/login?error=not_admin");
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, body.data!.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/admin");
}
