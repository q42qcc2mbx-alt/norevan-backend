import { redirect } from "next/navigation";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { getTeam } from "@/lib/team";
import { TeamManager } from "@/components/admin/TeamManager";

export const metadata = {
  title: "Team — Norevan Admin",
  robots: { index: false, follow: false },
};

export default async function TeamPage() {
  const user = await getAdminUser();
  if (!user || effectiveRole(user) !== "owner") redirect("/admin");

  const members = await getTeam();

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
          Team
        </h1>
      </header>

      <TeamManager initialMembers={members} currentUserId={user.id} />
    </div>
  );
}
