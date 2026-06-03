import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { updateOrderStatusAction } from "@/app/admin/_actions/orders";
import { OrderTimeline } from "@/components/account/OrderTimeline";

export const metadata = {
  title: "Bestellung — Norevan Admin",
  robots: { index: false, follow: false },
};

const STATUSES = ["demo", "paid", "shipped", "cancelled"] as const;

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const count = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <Link
        href="/admin/orders"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground"
      >
        ← Bestellungen
      </Link>

      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            Bestellung #{order.id.slice(0, 8)}
          </span>
          <h1
            className="mt-2 font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1 }}
          >
            {order.firstName} {order.lastName}
          </h1>
          <div className="mt-1 font-mono text-[10px] text-muted">
            {new Date(order.createdAt).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })}
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif tabular-nums" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.75rem", lineHeight: 1 }}>
            {formatPrice(order.subtotalCents, "de")}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{count} Artikel</div>
        </div>
      </header>

      <div className="max-w-md">
        <OrderTimeline status={order.status} locale="de" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Customer + address */}
        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Kunde & Lieferadresse</div>
          <div className="text-sm leading-relaxed text-foreground">
            <div>{order.firstName} {order.lastName}</div>
            <div className="text-muted">{order.email}</div>
            <div className="mt-3">{order.address}</div>
            <div>{order.zip} {order.city}</div>
            <div>{order.country}</div>
          </div>
        </div>

        {/* Status & fulfilment control */}
        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Status & Versand</div>
          <form action={updateOrderStatusAction} className="space-y-4">
            <input type="hidden" name="id" value={order.id} />

            <div className="flex items-center gap-3">
              <select
                name="status"
                defaultValue={order.status}
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-[10px] uppercase tracking-[0.2em]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">Versanddienst</span>
                <input
                  name="carrier"
                  defaultValue={order.carrier ?? ""}
                  placeholder="DHL, DPD, …"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">Tracking-Nr.</span>
                <input
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  placeholder="00340…"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm tabular-nums"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">Interne Notiz (nicht für Kunden)</span>
              <textarea
                name="notes"
                defaultValue={order.notes ?? ""}
                rows={2}
                placeholder="z. B. Kunde wünscht Lieferung an Nachbarn"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              className="h-10 w-full rounded-full bg-foreground px-5 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
            >
              Speichern
            </button>
          </form>
          <p className="mt-3 font-mono text-[10px] text-muted">
            „Versandt“ löst die Versand-Mail aus (inkl. Tracking-Nr.) · „Storniert“ bucht Bestand zurück.
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-md border border-border bg-card p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Artikel</div>
        <ul className="divide-y divide-border-subtle">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center gap-4 py-3">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-muted-bg">
                {it.image && (
                  <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">{it.name}</div>
                <div className="font-mono text-[10px] text-muted">
                  {it.qty}× {it.size ? `· Gr. ${it.size} ` : ""}· {formatPrice(it.priceCents, "de")}
                </div>
              </div>
              <div className="whitespace-nowrap text-sm tabular-nums text-foreground">
                {formatPrice(it.priceCents * it.qty, "de")}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
