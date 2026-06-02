"use server";

import { revalidatePath } from "next/cache";
import {
  createTeamMember,
  updateTeamRole,
  revokeTeamMember,
} from "@/lib/team";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { ApiError } from "@/lib/api/client";

const ROLES = ["viewer", "staff", "admin", "owner"] as const;

async function requireOwner() {
  const user = await getAdminUser();
  if (!user || effectiveRole(user) !== "owner") {
    throw new Error("unauthorized");
  }
}

export type CreateState =
  | { ok: true; email: string; tempPassword: string }
  | { ok: false; error: string }
  | null;

export async function createMemberAction(
  _prev: CreateState,
  form: FormData,
): Promise<CreateState> {
  await requireOwner();
  const username = String(form.get("username") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const role = String(form.get("role") ?? "").trim();

  if (!username || !email || !(ROLES as readonly string[]).includes(role)) {
    return { ok: false, error: "Bitte Name, E-Mail und gültige Rolle angeben." };
  }
  try {
    const res = await createTeamMember({ username, email, role });
    revalidatePath("/admin/team");
    return { ok: true, email: res.email, tempPassword: res.tempPassword };
  } catch (err) {
    const msg =
      err instanceof ApiError && err.status === 409
        ? "E-Mail oder Benutzername ist bereits vergeben."
        : "Anlegen fehlgeschlagen.";
    return { ok: false, error: msg };
  }
}

export async function updateRoleAction(form: FormData): Promise<void> {
  await requireOwner();
  const id = Number(form.get("id"));
  const role = String(form.get("role") ?? "");
  if (!Number.isInteger(id) || !(ROLES as readonly string[]).includes(role)) {
    throw new Error("invalid_input");
  }
  await updateTeamRole(id, role);
  revalidatePath("/admin/team");
}

export async function revokeAction(form: FormData): Promise<void> {
  await requireOwner();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id)) throw new Error("invalid_input");
  await revokeTeamMember(id);
  revalidatePath("/admin/team");
}
