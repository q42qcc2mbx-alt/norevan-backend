import "server-only";
import { cookies } from "next/headers";
import type { AuthUser, Role } from "./auth-context";

// Reads the session cookie set by /api/auth/login and returns the user, or null.
// Swap the decoding for your real session/JWT verification.

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const raw = jar.get("session")?.value;
  if (!raw) return null;
  try {
    const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as {
      email?: string;
      role?: string;
      name?: string;
    };
    const role: Role =
      decoded.role === "owner" || decoded.role === "admin" ? (decoded.role as Role) : "customer";
    return {
      email: decoded.email ?? "",
      name: decoded.name ?? decoded.email?.split("@")[0] ?? "Nutzer",
      role,
    };
  } catch {
    return null;
  }
}
