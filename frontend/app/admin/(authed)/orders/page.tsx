import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const metadata = {
  title: "Admin · Orders — Norevan",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders(200);

  const totalRevenueCents = orders.reduce((s, o) => s + o.subtotalCents, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            Norevan · Admin
          </span>
          <h1
            className="mt-2 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              lineHeight: 1,
            }}
          >
            Bestellungen
          </h1>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          <div>{orders.length} {orders.length === 1 ? "Order" : "Orders"}</div>
          <div className="mt-1 text-foreground">
            {formatPrice(totalRevenueCents, "de")}
          </div>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-md border border-border-subtle bg-card p-12 text-center">
          <p className="text-muted">
            Noch keine Bestellungen.{" "}
            <Link href="/de/checkout" className="underline underline-offset-4 hover:text-foreground">
              Demo-Checkout durchspielen
            </Link>
          </p>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
