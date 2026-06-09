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
import { AdminNavBar } from "./_components/AdminNavBar";
import { AdminAppNavBar } from "./_components/AdminAppNavBar";
import { DeviceProvider } from "@/components/device/DeviceProvider";
import { AppModeButton } from "@/components/device/AppModeButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const authed = await isAdminAuthed();
  if (!authed) redirect("/admin/login");
  return <>{children}</>;
}

/** Role-aware nav: Analytics only for admins/owners; shows a role chip. */
async function AdminNav() {
  await connection();
  const user = await getAdminUser();
  const role = user ? effectiveRole(user) : "staff";
  return (
    <AdminNavBar
      role={role}
      showAnalytics={canSeeRevenue(role)}
      showTeam={role === "owner"}
    />
  );
}

export default function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="relative border-b border-border bg-background print:hidden">
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
          <div className="flex items-center gap-3">
            <ThemeToggle label="Hell-/Dunkelmodus" />
            <AppModeButton />
            <Suspense fallback={<div className="h-9" aria-hidden />}>
              <AdminNav />
            </Suspense>
          </div>
        </div>
      </header>
      <main>
        <Suspense>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
      <DeviceProvider />
      <div className="print:hidden">
        <Suspense fallback={null}>
          <AdminAppNavBar />
        </Suspense>
      </div>
    </div>
  );
}
