import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdminAuthed } from "@/lib/auth/admin";

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const authed = await isAdminAuthed();
  if (!authed) redirect("/admin/login");
  return <>{children}</>;
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
          <nav className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em]">
            <Link href="/admin" className="hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="/admin/products" className="hover:underline underline-offset-4">
              Produkte
            </Link>
            <Link href="/admin/orders" className="hover:underline underline-offset-4">
              Bestellungen
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="text-muted hover:text-foreground"
              >
                Logout
              </button>
            </form>
          </nav>
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
