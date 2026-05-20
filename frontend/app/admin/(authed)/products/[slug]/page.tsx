import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { ProductForm } from "@/app/admin/_components/ProductForm";
import {
  updateProductAction,
  deleteProductAction,
} from "@/app/admin/_actions/products";

export const metadata = {
  title: "Produkt bearbeiten — Norevan Admin",
  robots: { index: false, follow: false },
};

async function EditProductBody({ slug }: { slug: string }) {
  const product = await getProduct(slug);
  if (!product) notFound();
  const action = updateProductAction.bind(null, slug);
  return (
    <>
      <header className="mb-8 flex items-end justify-between border-b border-border pb-6">
        <div>
          <Link
            href="/admin/products"
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground"
          >
            ← Produkte
          </Link>
          <h1
            className="mt-3 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              lineHeight: 1,
            }}
          >
            {product.name}
          </h1>
        </div>
        <form action={deleteProductAction.bind(null, slug)}>
          <button
            type="submit"
            className="rounded-full border border-red-600/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-red-600 hover:bg-red-600 hover:text-white"
          >
            Löschen
          </button>
        </form>
      </header>
      <ProductForm action={action} product={product} submitLabel="Speichern" />
    </>
  );
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <Suspense fallback={<div className="animate-pulse h-64 rounded-xl bg-muted-bg" />}>
        <EditProductBody slug={slug} />
      </Suspense>
    </div>
  );
}
