"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { api, ApiError } from "@/lib/api/client";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) throw new Error("unauthorized");
}

export type DiscountState = { ok: true } | { ok: false; error: string } | null;

export async function createDiscountAction(
  _prev: DiscountState,
  form: FormData,
): Promise<DiscountState> {
  await requireAdmin();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const type = String(form.get("type") ?? "percent");
  const rawValue = Number(form.get("value"));
  const minEuro = Number(form.get("minSubtotal") || 0);
  const maxUses = String(form.get("maxUses") ?? "").trim();
  const expiresAt = String(form.get("expiresAt") ?? "").trim();

  if (!code || !Number.isFinite(rawValue) || rawValue <= 0) {
    return { ok: false, error: "Code und gültiger Wert nötig." };
  }
  // Fixed amounts are entered in euros, stored in cents.
  const value = type === "fixed" ? Math.round(rawValue * 100) : Math.round(rawValue);

  try {
    await api.post("/admin/discounts", {
      code,
      type,
      value,
      minSubtotalCents: Math.round((Number.isFinite(minEuro) ? minEuro : 0) * 100),
      maxUses: maxUses === "" ? null : Number(maxUses),
      expiresAt: expiresAt === "" ? null : expiresAt,
    });
    revalidatePath("/admin/discounts");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : "Anlegen fehlgeschlagen.";
    return { ok: false, error: msg };
  }
}

export async function toggleDiscountAction(form: FormData): Promise<void> {
  await requireAdmin();
  const code = String(form.get("code") ?? "");
  const active = String(form.get("active") ?? "") === "true";
  await api.patch(`/admin/discounts/${encodeURIComponent(code)}`, { active });
  revalidatePath("/admin/discounts");
}
