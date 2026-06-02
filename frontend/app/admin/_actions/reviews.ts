"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { api } from "@/lib/api/client";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) {
    throw new Error("unauthorized");
  }
}

export async function deleteReviewAction(form: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id)) throw new Error("invalid_input");
  await api.delete(`/admin/reviews/${id}`);
  revalidatePath("/admin/reviews");
}
