import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/api/client";

export async function POST() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  redirect("/admin/login");
}
