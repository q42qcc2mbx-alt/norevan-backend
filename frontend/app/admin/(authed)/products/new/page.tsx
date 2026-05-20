import Link from "next/link";
import { ProductForm } from "@/app/admin/_components/ProductForm";
import { createProductAction } from "@/app/admin/_actions/products";

export const metadata = {
  title: "Neues Produkt — Norevan Admin",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-8 border-b border-border pb-6">
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
          Neues Produkt
        </h1>
      </header>

      <ProductForm action={createProductAction} submitLabel="Anlegen" />
    </div>
  );
}
