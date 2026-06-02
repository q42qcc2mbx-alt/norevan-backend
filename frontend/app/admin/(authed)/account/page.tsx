import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const metadata = {
  title: "Konto — Norevan Admin",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Inhaber",
  admin: "Admin",
  staff: "Mitarbeiter",
  viewer: "Leser",
};

export default async function AdminAccountPage() {
  const user = await getAdminUser();
  const role = user ? effectiveRole(user) : "staff";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Dein Zugang
        </span>
        <h1
          className="mt-2 font-serif"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
            lineHeight: 1,
          }}
        >
          Konto
        </h1>
      </header>

      <div className="mb-10 rounded-md border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Angemeldet als
        </div>
        <div className="mt-1 text-base text-foreground">{user?.email ?? "—"}</div>
        <div className="mt-2 inline-block rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          {ROLE_LABEL[role] ?? role}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Passwort ändern
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
