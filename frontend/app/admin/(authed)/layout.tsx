import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminUser, effectiveRole, isAdminAuthed } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const user = await getAdminUser();
  const role = user ? effectiveRole(user) : "staff";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar role={role} email={user?.email ?? ""} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export default function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      }
    >
      <Shell>{children}</Shell>
    </Suspense>
  );
}
