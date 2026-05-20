import { cookies } from "next/headers";
import { API_BASE_URL, AUTH_COOKIE } from "@/lib/api/client";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  let email: string, password: string;
  try {
    const body = await req.json();
    email = String(body.email ?? "").trim();
    password = String(body.password ?? "");
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

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
    return Response.json(
      { error: body.message ?? "invalid_credentials" },
      { status: 401 },
    );
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, body.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return Response.json({ status: "ok" });
}
