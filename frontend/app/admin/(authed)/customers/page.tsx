import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getCustomers } from "@/lib/customers";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Kunden — Norevan Admin",
  robots: { index: false, follow: false },
};

const SEGMENT_LABEL: Record<string, string> = {
  neu: "Neu",
  wiederkäufer: "Wiederkäufer",
  vip: "VIP",
};

export default async function CustomersPage() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const customers = await getCustomers();
  const vips = customers.filter((c) => c.segment === "vip").length;
  const repeat = customers.filter((c) => c.segment === "wiederkäufer").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          CRM
        </span>
        <h1
          className="mt-2 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
            lineHeight: 1,
          }}
        >
          Kunden
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Kunden" value={customers.length.toLocaleString("de-DE")} />
        <Stat label="Wiederkäufer" value={repeat.toLocaleString("de-DE")} />
        <Stat label="VIP · ≥ 500 €" value={vips.toLocaleString("de-DE")} />
      </div>

      <div className="mt-10 rounded-md border border-border bg-card">
        <div className="border-b border-border px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Nach Lifetime-Value
        </div>
        {customers.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted">Noch keine Kunden.</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {customers.map((c) => (
              <li key={c.email}>
                <Link
                  href={`/admin/customers/${encodeURIComponent(c.email)}`}
                  className="flex flex-wrap items-center gap-3 px-6 py-3.5 transition-colors hover:bg-background/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-foreground">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="truncate font-mono text-[10px] text-muted">
                      {c.email}
                    </div>
                  </div>
                  <span className="rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                    {SEGMENT_LABEL[c.segment]}
                  </span>
                  <span className="w-16 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted tabular-nums">
                    {c.orderCount}×
                  </span>
                  <span className="w-24 text-right text-sm tabular-nums">
                    {formatPrice(c.totalSpentCents, "de")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div
        className="mt-3 font-serif tabular-nums"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
