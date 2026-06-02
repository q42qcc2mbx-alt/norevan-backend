import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { api, AUTH_COOKIE } from "@/lib/api/client";

export type BackofficeRole =
  | "customer"
  | "viewer"
  | "staff"
  | "admin"
  | "owner";

type DashboardUser = {
  id: number;
  username: string;
  email: string;
  is_admin?: number;
  role?: BackofficeRole;
  created_at: string;
};

/** Roles that may enter the back office at all. */
const BACKOFFICE_ROLES = new Set<BackofficeRole>([
  "viewer",
  "staff",
  "admin",
  "owner",
]);

/** Effective role, tolerating legacy rows that only have is_admin. */
export function effectiveRole(user: {
  role?: BackofficeRole;
  is_admin?: number;
}): BackofficeRole {
  return user.role ?? (user.is_admin ? "admin" : "customer");
}

export function isBackoffice(user: {
  role?: BackofficeRole;
  is_admin?: number;
}): boolean {
  return BACKOFFICE_ROLES.has(effectiveRole(user));
}

/** Only admins & owners may see revenue and analytics. */
export function canSeeRevenue(role: BackofficeRole): boolean {
  return role === "admin" || role === "owner";
}

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
 * Verifies the token AND confirms the user may enter the back office (any
 * privileged role: viewer/staff/admin/owner) via the backend dashboard call.
 * Used by /admin pages and server actions as the access gate.
 */
export async function isAdminAuthed(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * Returns the current back-office user (incl. role), or null if the visitor is
 * not signed in or is just a customer. Used for the access gate and for
 * role-based UI (hiding revenue/analytics from staff).
 */
export async function getAdminUser(): Promise<DashboardUser | null> {
  const decoded = await decodeToken();
  if (!decoded) return null;
  try {
    const res = await api.get<{ user: DashboardUser }>("/dashboard", {
      cache: "no-store",
    });
    if (!res?.user || !isBackoffice(res.user)) return null;
    return res.user;
  } catch {
    return null;
  }
}
