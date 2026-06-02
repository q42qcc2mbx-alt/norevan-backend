// Server-only audit-log data layer. Calls the Express backend (owner-gated).
import "server-only";
import { api } from "@/lib/api/client";

export type AuditEntry = {
  id: number;
  action: string;
  target: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  actor_username: string | null;
  actor_email: string | null;
};

export async function getAudit(limit = 100): Promise<AuditEntry[]> {
  try {
    return await api.get<AuditEntry[]>(`/admin/audit?limit=${limit}`, {
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[audit] getAudit failed:", (err as Error).message);
    return [];
  }
}
