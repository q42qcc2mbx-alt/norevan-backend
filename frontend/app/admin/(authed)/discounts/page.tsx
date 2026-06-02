import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getDiscounts } from "@/lib/discounts";
import { DiscountManager } from "@/components/admin/DiscountManager";

export const metadata = {
  title: "Rabatte — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDiscountsPage() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const codes = await getDiscounts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Marketing
        </span>
        <h1
          className="mt-2 font-serif"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.75rem, 3vw, 2.75rem)", lineHeight: 1 }}
        >
          Rabattcodes
        </h1>
      </header>
      <DiscountManager initial={codes} />
    </div>
  );
}
