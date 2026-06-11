import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// ── STUB login route ───────────────────────────────────────────────────────
// Replace the body with your real check (Supabase, Postgres + bcrypt, etc.).
// On success, set a session cookie and the client redirects to /dashboard.
//
// This stub accepts any email/password so you can click through the UI; it
// stores a fake session with a role derived from the email for testing:
//   owner@...  → owner   ·   admin@... → admin   ·   anything else → customer.

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 });
  }

  // TODO: verify credentials against your user store here.
  const role = email.startsWith("owner@")
    ? "owner"
    : email.startsWith("admin@")
      ? "admin"
      : "customer";

  // Demo session cookie. In production, set a signed JWT or a server session.
  const session = JSON.stringify({ email, role, name: email.split("@")[0] });
  const jar = await cookies();
  jar.set("session", Buffer.from(session).toString("base64"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
