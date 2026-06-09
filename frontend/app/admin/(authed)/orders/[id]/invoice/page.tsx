import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = {
  title: "Rechnung — Norevan",
  robots: { index: false, follow: false },
};

// Seller details (Impressum). Adjust here if the legal entity changes.
const SELLER = {
  name: "Norevan UG (haftungsbeschränkt)",
  street: "Musterstraße 1",
  city: "10115 Berlin",
  email: "hello@norevan.shop",
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const created = new Date(order.createdAt);
  const invoiceNo = `NR-${created.getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;
  const itemsTotal = order.items.reduce((s, i) => s + i.priceCents * i.qty, 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      {/* Action bar — not printed */}
      <div className="print:hidden mb-8 flex items-center justify-between gap-4">
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground"
        >
          ← Zur Bestellung
        </Link>
        <PrintButton label="Drucken / Als PDF" />
      </div>

      {/* Invoice sheet */}
      <div className="rounded-md border border-border bg-card p-8 md:p-12 print:border-0 print:bg-white print:p-0 print:text-black">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6 print:border-black/20">
          <div>
            <div
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", lineHeight: 1 }}
            >
              Norevan
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted print:text-black/60">
              Premium Streetwear
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem", lineHeight: 1 }}
            >
              Rechnung
            </div>
            <div className="mt-2 font-mono text-[11px] tabular-nums text-muted print:text-black/70">
              Nr. {invoiceNo}
            </div>
            <div className="font-mono text-[11px] tabular-nums text-muted print:text-black/70">
              {created.toLocaleDateString("de-DE", { dateStyle: "long" })}
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.25em] text-muted print:text-black/60">
              Verkäufer
            </div>
            <div className="text-sm leading-relaxed">
              {SELLER.name}
              <br />
              {SELLER.street}
              <br />
              {SELLER.city}
              <br />
              {SELLER.email}
            </div>
          </div>
          <div className="sm:text-right">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.25em] text-muted print:text-black/60">
              Rechnung an
            </div>
            <div className="text-sm leading-relaxed">
              {order.firstName} {order.lastName}
              <br />
              {order.address}
              <br />
              {order.zip} {order.city}
              <br />
              {order.country}
              <br />
              {order.email}
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[9px] uppercase tracking-[0.2em] text-muted print:border-black/20 print:text-black/60">
              <th className="py-2">Artikel</th>
              <th className="py-2 text-center">Menge</th>
              <th className="py-2 text-right">Einzelpreis</th>
              <th className="py-2 text-right">Summe</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-b border-border-subtle print:border-black/10">
                <td className="py-3">
                  {it.name}
                  {it.size ? (
                    <span className="text-muted print:text-black/60"> · Gr. {it.size}</span>
                  ) : null}
                </td>
                <td className="py-3 text-center tabular-nums">{it.qty}</td>
                <td className="py-3 text-right tabular-nums">{formatPrice(it.priceCents, "de")}</td>
                <td className="py-3 text-right tabular-nums">
                  {formatPrice(it.priceCents * it.qty, "de")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-muted print:text-black/70">
              <span>Zwischensumme</span>
              <span className="tabular-nums">{formatPrice(itemsTotal, "de")}</span>
            </div>
            <div className="flex justify-between text-muted print:text-black/70">
              <span>Versand</span>
              <span className="tabular-nums">Kostenlos</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium print:border-black/20">
              <span>Gesamt</span>
              <span className="tabular-nums">{formatPrice(order.subtotalCents, "de")}</span>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted print:border-black/20 print:text-black/60">
          Vielen Dank für deinen Einkauf bei Norevan
        </p>
      </div>
    </div>
  );
}
