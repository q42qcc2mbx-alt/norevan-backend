import { redirect } from "next/navigation";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";
import { getSubscribers } from "@/lib/newsletter";

export const metadata = {
  title: "Newsletter — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function NewsletterPage() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) redirect("/admin");

  const subscribers = await getSubscribers(2000);
  const active = subscribers.filter((s) => !s.unsubscribed);

  // Subscribers in the last 30 days.
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = active.filter(
    (s) => new Date(s.subscribedAt).getTime() >= since,
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Marketing
        </span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1
            className="font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              lineHeight: 1,
            }}
          >
            Newsletter
          </h1>
          {active.length > 0 && (
            <a
              href="/api/admin/newsletter/export"
              className="rounded-full border border-border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              CSV exportieren
            </a>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Abonnenten" value={active.length.toLocaleString("de-DE")} />
        <Stat label="Neu · 30 Tage" value={recent.toLocaleString("de-DE")} />
        <Stat
          label="Abgemeldet"
          value={(subscribers.length - active.length).toLocaleString("de-DE")}
        />
      </div>

      <div className="mt-10 rounded-md border border-border bg-card p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Liste
        </div>
        {subscribers.length === 0 ? (
          <p className="text-sm text-muted">
            Noch keine Anmeldungen — oder die Tabelle{" "}
            <code className="font-mono">newsletter_subscribers</code> wurde noch
            nicht angelegt (siehe db/migrations/008_newsletter.sql).
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {subscribers.map((s) => (
              <li
                key={s.email}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span
                  className={
                    s.unsubscribed
                      ? "text-muted line-through"
                      : "text-foreground"
                  }
                >
                  {s.email}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted tabular-nums">
                  {new Date(s.subscribedAt).toLocaleDateString("de-DE")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div
        className="mt-3 font-serif tabular-nums"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
