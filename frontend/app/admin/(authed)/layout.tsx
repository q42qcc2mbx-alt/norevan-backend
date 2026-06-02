import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  isAdminAuthed,
  getAdminUser,
  canSeeRevenue,
  effectiveRole,
} from "@/lib/auth/admin";

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const authed = await isAdminAuthed();
  if (!authed) redirect("/admin/login");
  return <>{children}</>;
}

const navLink = "hover:underline underline-offset-4";

function NavLinks({ showAnalytics }: { showAnalytics: boolean }) {
  return (
    <>
      <Link href="/admin" className={navLink}>Dashboard</Link>
      <Link href="/admin/products" className={navLink}>Produkte</Link>
      <Link href="/admin/orders" className={navLink}>Bestellungen</Link>
      {showAnalytics && (
        <Link href="/admin/analytics" className={navLink}>Analytics</Link>
      )}
    </>
  );
}

/** Role-aware nav: Analytics only for admins/owners; shows a role chip. */
async function AdminNav() {
  await connection();
  const user = await getAdminUser();
  const role = user ? effectiveRole(user) : "staff";
  return (
    <nav className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em]">
      <NavLinks showAnalytics={canSeeRevenue(role)} />
      <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[9px] tracking-[0.2em] text-muted">
        {role}
      </span>
      <form action="/api/admin/logout" method="POST">
        <button type="submit" className="text-muted hover:text-foreground">
          Logout
        </button>
      </form>
    </nav>
  );
}

export default function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/admin" className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
              Norevan
            </span>
            <span
              className="font-serif italic"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.25rem",
              }}
            >
              admin
            </span>
          </Link>
          <Suspense
            fallback={
              <nav className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em]">
                <NavLinks showAnalytics={false} />
              </nav>
            }
          >
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main>
        <Suspense>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
    </div>
  );
}
