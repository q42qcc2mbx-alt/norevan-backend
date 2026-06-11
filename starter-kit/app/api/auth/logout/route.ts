import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Clears the session cookie and sends the user back to /login.
export async function POST() {
  const jar = await cookies();
  jar.delete("session");
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  );
}
