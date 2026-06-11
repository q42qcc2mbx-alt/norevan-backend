import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// STUB register route — mirrors the login stub. Replace with a real "create
// user" flow (hash the password, insert into your DB), then start a session.
// New sign-ups become "customer" by default.

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string; name?: string }
    | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "").trim() || email.split("@")[0];

  if (!email || !password) {
    return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 });
  }

  // TODO: create the user in your store here.
  const session = JSON.stringify({ email, role: "customer", name });
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
