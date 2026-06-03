import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getCustomer } from "@/lib/customers";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Kunde — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const { email } = await params;
  const decoded = decodeURIComponent(email);
  const data = await getCustomer(decoded);
  if (!data) notFound();

  const { customer, orders } = data;
  // Most recent shipping address on file.
  const latest = orders[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <Link
        href="/admin/customers"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground"
      >
        ← Kunden
      </Link>

      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            Kunde
          </span>
          <h1
            className="mt-2 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              lineHeight: 1,
            }}
          >
            {customer.firstName} {customer.lastName}
          </h1>
          <div className="mt-1 font-mono text-[10px] text-muted">{customer.email}</div>
        </div>
        <div className="text-right">
          <div
            className="font-serif tabular-nums"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.75rem",
              lineHeight: 1,
            }}
          >
            {formatPrice(customer.totalSpentCents, "de")}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {customer.orderCount} Bestellungen · {customer.segment.toUpperCase()}
          </div>
        </div>
      </header>

      {latest && (
        <div className="mb-6 rounded-md border border-border bg-card p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Letzte Lieferadresse
          </div>
          <div className="text-sm leading-relaxed text-foreground">
            <div>{latest.address}</div>
            <div>{latest.zip} {latest.city}</div>
            <div>{latest.country}</div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Bestellhistorie
        </div>
        <ul className="divide-y divide-border-subtle">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex flex-wrap items-center gap-3 px-6 py-3.5 transition-colors hover:bg-background/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">
                    #{o.id.slice(0, 8)}
                    <span className="ml-2 font-mono text-[10px] text-muted">
                      {new Date(o.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted">
                    {o.items.reduce((s, i) => s + i.qty, 0)} Artikel
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {o.status}
                </span>
                <span className="w-24 text-right text-sm tabular-nums">
                  {formatPrice(o.subtotalCents, "de")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
