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

  // Fulfilment fields are only forwarded when present on the form, so the
  // dashboard's quick "mark shipped" button doesn't clear an existing note.
  const fulfilment: { trackingNumber?: string; carrier?: string; notes?: string } = {};
  if (form.has("trackingNumber")) fulfilment.trackingNumber = String(form.get("trackingNumber") ?? "");
  if (form.has("carrier")) fulfilment.carrier = String(form.get("carrier") ?? "");
  if (form.has("notes")) fulfilment.notes = String(form.get("notes") ?? "");

  await updateOrderStatus(id, status, fulfilment);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}
