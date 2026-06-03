import { CATEGORIES, KNOWN_BRANDS, type Product } from "@/lib/products-types";

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (form: FormData) => void | Promise<void>;
  product?: Product;
  submitLabel: string;
}) {
  const imagesText = product
    ? product.images.map((i) => `${i.src} | ${i.alt}`).join("\n")
    : "";
  const specsText = product
    ? product.specs
        .map(
          (s) =>
            `${s.label.de} | ${s.label.en} | ${s.value.de} | ${s.value.en}`,
        )
        .join("\n")
    : "";
  const stockBySizeText = product?.stockBySize
    ? Object.entries(product.stockBySize)
        .map(([size, qty]) => `${size} | ${qty}`)
        .join("\n")
    : "";

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" required defaultValue={product?.name} />
        <Field
          label="Slug (optional, sonst aus Name)"
          name="slug"
          defaultValue={product?.slug}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          label="Brand"
          name="brand"
          defaultValue={product?.brand ?? "generic"}
          options={[...KNOWN_BRANDS, "generic"].map((b) => ({
            value: b,
            label: b,
          }))}
        />
        <Field
          label="Preis (€)"
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={
            product ? (product.priceCents / 100).toFixed(2) : undefined
          }
        />
        <Field
          label="Stock"
          name="stock"
          type="number"
          defaultValue={String(product?.stock ?? 0)}
        />
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Kategorien (min. 1)
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label
              key={c}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
            >
              <input
                type="checkbox"
                name="categories"
                value={c}
                defaultChecked={product?.categories.includes(c) ?? false}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          label="Beschreibung (DE)"
          name="description_de"
          required
          rows={4}
          defaultValue={product?.description.de}
        />
        <Textarea
          label="Beschreibung (EN)"
          name="description_en"
          required
          rows={4}
          defaultValue={product?.description.en}
        />
      </div>

      <Textarea
        label="Bilder — eine pro Zeile, Format: src | alt"
        name="images"
        required
        rows={4}
        defaultValue={imagesText}
        placeholder="/products/example.png | Example product"
      />

      <Textarea
        label="Specs — eine pro Zeile: label.de | label.en | value.de | value.en"
        name="specs"
        rows={4}
        defaultValue={specsText}
        placeholder="Material | Material | Baumwolle | Cotton"
      />

      <Field
        label="Größen (Komma-getrennt, optional)"
        name="sizes"
        defaultValue={product?.sizes?.join(", ")}
        placeholder="XS, S, M, L, XL"
      />

      <Textarea
        label="Bestand je Größe (optional) — eine pro Zeile: Größe | Anzahl. Überschreibt „Stock“."
        name="stock_by_size"
        rows={4}
        defaultValue={stockBySizeText}
        placeholder={"M | 5\nL | 3\nXL | 0"}
      />

      <div className="flex flex-wrap gap-4">
        <Checkbox label="Highlight (auf Startseite)" name="highlight" defaultChecked={product?.highlight} />
        <Checkbox label="Hero (Top-Produkt)" name="hero" defaultChecked={product?.hero} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-full bg-foreground px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function Textarea({
  label,
  ...rest
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
      <textarea
        {...rest}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  ...rest
}: {
  label: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
      <select
        {...rest}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" {...rest} />
      {label}
    </label>
  );
}
