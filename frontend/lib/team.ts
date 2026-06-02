// Server-only team data layer. Calls the Express backend (owner-gated).
import "server-only";
import { api } from "@/lib/api/client";

export type TeamMember = {
  id: number;
  username: string;
  email: string;
  role: string;
  is_admin: number;
  created_at: string;
};

export async function getTeam(): Promise<TeamMember[]> {
  try {
    return await api.get<TeamMember[]>("/admin/team", { cache: "no-store" });
  } catch (err) {
    console.warn("[team] getTeam failed:", (err as Error).message);
    return [];
  }
}

export async function createTeamMember(body: {
  username: string;
  email: string;
  role: string;
}): Promise<{ id: number; email: string; role: string; tempPassword: string }> {
  return api.post("/admin/team", body);
}

export async function updateTeamRole(id: number, role: string): Promise<void> {
  await api.patch(`/admin/team/${id}`, { role });
}

export async function revokeTeamMember(id: number): Promise<void> {
  await api.delete(`/admin/team/${id}`);
}
