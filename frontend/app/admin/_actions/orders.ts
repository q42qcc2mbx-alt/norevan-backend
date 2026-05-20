"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders";
import { isAdminAuthed } from "@/lib/auth/admin";

const ALLOWED_STATUSES = ["pending", "paid", "shipped", "cancelled", "demo"] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

function isStatus(v: string): v is OrderStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(v);
}

async function requireAuth() {
  if (!(await isAdminAuthed())) {
    throw new Error("unauthorized");
  }
}

export async function updateOrderStatusAction(form: FormData): Promise<void> {
  await requireAuth();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !isStatus(status)) {
    throw new Error("invalid_input");
  }
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
