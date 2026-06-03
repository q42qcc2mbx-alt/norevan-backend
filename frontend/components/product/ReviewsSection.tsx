"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stars } from "./Stars";
import type { ReviewSummary } from "@/lib/reviews";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

export function ReviewsSection({
  slug,
  locale,
  initial,
}: {
  slug: string;
  locale: Locale;
  initial: ReviewSummary;
}) {
  const router = useRouter();
  const isDe = locale === "de";
  // Defensive: a malformed review payload must never crash the whole product
  // page. The data layer normally guarantees an array, this is belt-and-braces.
  const items = initial.items ?? [];
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (submitting || rating < 1) {
      setError(isDe ? "Bitte zuerst Sterne vergeben." : "Please pick a rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating, body }),
      });
      if (res.status === 401) {
        setError(isDe ? "Bitte melde dich an, um zu bewerten." : "Please sign in to review.");
        return;
      }
      if (!res.ok) throw new Error("failed");
      setDone(true);
      setBody("");
      setRating(0);
      router.refresh();
    } catch {
      setError(isDe ? "Speichern fehlgeschlagen." : "Could not save.");
    } finally {
      setSubmitting(false);
    }
  }

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString(isDe ? "de-DE" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="mt-16 border-t border-border-subtle pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          className="font-serif"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
        >
          {isDe ? "Bewertungen" : "Reviews"}
        </h2>
        {initial.count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={initial.average} size={16} />
            <span className="font-mono text-[11px] text-muted">
              {initial.average.toFixed(1)} · {initial.count}{" "}
              {isDe ? "Bewertungen" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* Write a review */}
      <div className="mt-8 rounded-md border border-border bg-card p-6">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {isDe ? "Bewertung schreiben" : "Write a review"}
        </div>
        <div className="flex items-center gap-1 text-[var(--gold)]">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} ${isDe ? "Sterne" : "stars"}`}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={(hover || rating) >= n ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.9l-5.8 3.05 1.1-6.45-4.7-4.6 6.5-.95L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder={isDe ? "Wie war das Produkt? (optional)" : "How was it? (optional)"}
          className="mt-4 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        />
        {error && <p className="mt-2 font-mono text-[10px] text-red-400">{error}</p>}
        {done && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
            {isDe ? "Danke für deine Bewertung ✓" : "Thanks for your review ✓"}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-full bg-foreground px-7 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? (isDe ? "Wird gesendet…" : "Sending…") : isDe ? "Absenden" : "Submit"}
          </button>
          <Link
            href={`/${locale}/login?next=/${locale}/shop/${slug}`}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            {isDe ? "Nicht angemeldet?" : "Not signed in?"}
          </Link>
        </div>
      </div>

      {/* Existing reviews */}
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          {isDe ? "Noch keine Bewertungen — sei die/der Erste." : "No reviews yet — be the first."}
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {items.map((r) => (
            <li key={r.id} className="border-b border-border-subtle pb-6 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} size={13} />
                  <span className="text-sm font-medium text-foreground">{r.authorName}</span>
                  {r.verified && (
                    <span className={cn(
                      "rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--gold)]",
                    )}>
                      {isDe ? "Verifizierter Kauf" : "Verified buyer"}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted">{fmtDate(r.createdAt)}</span>
              </div>
              {r.body && <p className="mt-2 text-sm leading-relaxed text-foreground/85">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
