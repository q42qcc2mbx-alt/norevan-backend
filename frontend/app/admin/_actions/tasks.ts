"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { api, ApiError } from "@/lib/api/client";

async function role() {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return effectiveRole(user);
}
const isAdmin = (r: string) => r === "admin" || r === "owner";

export type CreateTaskState = { ok: true } | { ok: false; error: string } | null;

export async function createTaskAction(
  _prev: CreateTaskState,
  form: FormData,
): Promise<CreateTaskState> {
  if (!isAdmin(await role())) return { ok: false, error: "Keine Berechtigung." };
  const title = String(form.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Titel erforderlich." };
  try {
    await api.post("/tasks", {
      title,
      description: String(form.get("description") ?? ""),
      assigneeId: form.get("assigneeId") || null,
      priority: String(form.get("priority") ?? "medium"),
      dueDate: form.get("dueDate") || null,
    });
    revalidatePath("/admin/tasks");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Fehlgeschlagen." };
  }
}

export async function setTaskStatusAction(form: FormData): Promise<void> {
  await role(); // any back-office user; backend enforces assignee/admin
  const id = Number(form.get("id"));
  const status = String(form.get("status") ?? "");
  if (!Number.isInteger(id)) throw new Error("invalid");
  await api.patch(`/tasks/${id}`, { status });
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${id}`);
}

export async function commentTaskAction(form: FormData): Promise<void> {
  await role();
  const id = Number(form.get("id"));
  const body = String(form.get("body") ?? "").trim();
  if (!Number.isInteger(id) || !body) throw new Error("invalid");
  await api.post(`/tasks/${id}/comments`, { body });
  revalidatePath(`/admin/tasks/${id}`);
}

export async function deleteTaskAction(form: FormData): Promise<void> {
  if (!isAdmin(await role())) throw new Error("unauthorized");
  const id = Number(form.get("id"));
  if (!Number.isInteger(id)) throw new Error("invalid");
  await api.delete(`/tasks/${id}`);
  revalidatePath("/admin/tasks");
}
