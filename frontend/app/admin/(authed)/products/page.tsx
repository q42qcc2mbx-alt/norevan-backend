import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { deleteProductAction } from "@/app/admin/_actions/products";

export const metadata = {
  title: "Produkte — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            Katalog
          </span>
          <h1
            className="mt-2 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              lineHeight: 1,
            }}
          >
            Produkte
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-foreground px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
        >
          + Neues Produkt
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center text-muted">
          Noch keine Produkte. Lege das erste an.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-background-soft text-left font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                <th className="px-4 py-3 w-20">Bild</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Preis</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.slug}
                  className="border-b border-border-subtle last:border-0 hover:bg-muted-bg/40"
                >
                  <td className="px-4 py-3">
                    {p.images[0] && (
                      <div className="relative h-12 w-12 overflow-hidden rounded-sm bg-muted-bg">
                        <Image
                          src={p.images[0].src}
                          alt={p.images[0].alt}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="font-mono text-[10px] text-muted">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{p.brand}</td>
                  <td className="px-4 py-3 tabular-nums">{p.stock ?? 0}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(p.priceCents, "de")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.highlight && (
                        <span className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                          Highlight
                        </span>
                      )}
                      {p.hero && (
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                          Hero
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.slug}`}
                        className="font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                      <form
                        action={deleteProductAction.bind(null, p.slug)}
                      >
                        <button
                          type="submit"
                          className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-600 underline-offset-4 hover:underline"
                        >
                          Del
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
