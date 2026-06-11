"use client";

import { useAuth, ROLE_LABEL } from "../lib/auth-context";
import { navFor } from "../lib/roles";

// Role-aware dashboard frame: top bar with the user + role badge, a sidebar nav
// that changes per role (owner/admin/customer), and your page content.

export function DashboardShell({
  active,
  children,
}: {
  active?: string;
  children: React.ReactNode;
}) {
  const { role, name, email } = useAuth();
  const nav = navFor(role);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold tracking-tight">YourBrand</div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-medium">{name}</span>
              <span className="block text-[10px] text-neutral-400">{email}</span>
            </span>
            <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
              {ROLE_LABEL[role]}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button className="text-xs text-neutral-500 hover:text-neutral-900">Logout</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active === item.href
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span className="w-4 text-center opacity-70">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white md:hidden">
        {nav.slice(0, 4).map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
              active === item.href ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
