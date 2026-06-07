import "server-only";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Auth, Role } from "./auth-context";

/**
 * Resolve the visitor's real role from the live session:
 *  - Back-office JWT (owner/admin/staff/viewer) → "owner" or "admin"
 *  - else a signed-in Supabase user → "customer"
 *  - else null (not signed in) → caller shows the sign-in gate.
 */
export async function resolveAuth(): Promise<Auth | null> {
  // 1) Back office (owner has the full picture; staff/viewer/admin share the
  //    operational Admin view).
  try {
    const admin = await getAdminUser();
    if (admin) {
      const r = effectiveRole(admin);
      const role: Role = r === "owner" ? "owner" : "admin";
      return { role, person: admin.username, email: admin.email };
    }
  } catch {
    /* fall through to customer check */
  }

  // 2) Signed-in customer (Supabase).
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const email = user.email ?? "";
      const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
      const person = meta.full_name || meta.name || email.split("@")[0] || "Kundin";
      return { role: "customer", person, email };
    }
  } catch {
    /* not signed in */
  }

  return null;
}
