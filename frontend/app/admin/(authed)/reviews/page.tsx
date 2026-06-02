import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getAllReviews } from "@/lib/reviews";
import { deleteReviewAction } from "@/app/admin/_actions/reviews";
import { Stars } from "@/components/product/Stars";

export const metadata = {
  title: "Bewertungen — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const reviews = await getAllReviews();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Moderation
        </span>
        <h1
          className="mt-2 font-serif"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.75rem, 3vw, 2.75rem)", lineHeight: 1 }}
        >
          Bewertungen
        </h1>
      </header>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Bewertungen.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-md border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} size={13} />
                    <span className="text-sm font-medium text-foreground">{r.authorName}</span>
                    {r.verified && (
                      <span className="rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--gold)]">
                        Verifiziert
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/de/shop/${r.productSlug}`}
                    className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-foreground"
                  >
                    {r.productSlug}
                  </Link>
                  {r.body && <p className="mt-2 text-sm text-foreground/85">{r.body}</p>}
                </div>
                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-red-400"
                  >
                    Löschen
                  </button>
                </form>
              </div>
              <div className="mt-2 font-mono text-[9px] text-muted">
                {new Date(r.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
