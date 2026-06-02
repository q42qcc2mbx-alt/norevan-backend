import { redirect } from "next/navigation";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { getAudit, type AuditEntry } from "@/lib/audit";

export const metadata = {
  title: "Protokoll — Norevan Admin",
  robots: { index: false, follow: false },
};

const ACTION_LABEL: Record<string, string> = {
  "team.create": "Mitglied angelegt",
  "team.role": "Rolle geändert",
  "team.revoke": "Zugriff entzogen",
};

function describeMeta(action: string, meta: AuditEntry["meta"]): string {
  if (!meta) return "";
  if (action === "team.role") return `${meta.from ?? "?"} → ${meta.to ?? "?"}`;
  if (action === "team.create") return `Rolle: ${meta.role ?? "?"}`;
  if (action === "team.revoke") return `war: ${meta.from ?? "?"}`;
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" · ");
}

export default async function AuditPage() {
  const user = await getAdminUser();
  if (!user || effectiveRole(user) !== "owner") redirect("/admin");

  const entries = await getAudit(200);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Nur für Inhaber
        </span>
        <h1
          className="mt-2 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
            lineHeight: 1,
          }}
        >
          Protokoll
        </h1>
        <p className="mt-3 text-sm text-muted">
          Änderungen im Back-Office — wer was wann gemacht hat.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Einträge.</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <ul className="divide-y divide-border-subtle">
            {entries.map((e) => {
              const when = new Date(e.created_at).toLocaleString("de-DE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const detail = describeMeta(e.action, e.meta);
              return (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4">
                  <span className="w-40 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {when}
                  </span>
                  <span className="flex-1 text-sm text-foreground">
                    {ACTION_LABEL[e.action] ?? e.action}
                    {e.target && (
                      <span className="text-muted"> · {e.target}</span>
                    )}
                    {detail && (
                      <span className="font-mono text-[11px] text-muted"> ({detail})</span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {e.actor_username ?? e.actor_email ?? "system"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
