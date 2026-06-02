import "server-only";
import { api } from "@/lib/api/client";

export type DiscountCode = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  min_subtotal_cents: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
};

export async function getDiscounts(): Promise<DiscountCode[]> {
  try {
    return await api.get<DiscountCode[]>("/admin/discounts", { cache: "no-store" });
  } catch (err) {
    console.warn("[discounts] getDiscounts failed:", (err as Error).message);
    return [];
  }
}
