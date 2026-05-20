import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { api, AUTH_COOKIE } from "@/lib/api/client";

type DashboardUser = {
  id: number;
  username: string;
  email: string;
  is_admin?: number;
  created_at: string;
};

let cachedKey: Uint8Array | null = null;
function getJwtKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing on the frontend. It must match the backend's JWT_SECRET.",
    );
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

/** Decodes the JWT cookie locally (cheap), without contacting the backend. */
export async function decodeToken(): Promise<{
  userId: number;
  username: string;
} | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtKey());
    return {
      userId: Number(payload.userId),
      username: String(payload.username),
    };
  } catch {
    return null;
  }
}

/**
 * Verifies the token AND confirms is_admin=1 via the backend dashboard call.
 * Used by /admin pages and server actions.
 */
export async function isAdminAuthed(): Promise<boolean> {
  const decoded = await decodeToken();
  if (!decoded) return false;
  try {
    const user = await api.get<{ user: DashboardUser }>("/dashboard", {
      cache: "no-store",
    });
    return Boolean(user?.user?.is_admin);
  } catch {
    return false;
  }
}

/** Returns the current admin user (or null) for displaying in the chrome. */
export async function getAdminUser(): Promise<DashboardUser | null> {
  const decoded = await decodeToken();
  if (!decoded) return null;
  try {
    const res = await api.get<{ user: DashboardUser }>("/dashboard", {
      cache: "no-store",
    });
    if (!res?.user?.is_admin) return null;
    return res.user;
  } catch {
    return null;
  }
}
