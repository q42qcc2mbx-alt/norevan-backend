import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/api/client";

export async function POST() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  return Response.json({ status: "ok" });
}
