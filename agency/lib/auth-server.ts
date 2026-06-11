import { SUPABASE_URL, SUPABASE_KEY } from "./supabase";

export interface VerifiedUser {
  id: string;
  email: string;
}

/**
 * Server-side check of a Supabase access token (sent by the client as
 * Authorization: Bearer <token>). Returns the user or null.
 */
export async function verifyUser(req: Request): Promise<VerifiedUser | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; email?: string };
    if (!user.id || !user.email) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}
