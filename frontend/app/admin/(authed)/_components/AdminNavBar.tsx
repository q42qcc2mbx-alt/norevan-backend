"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Responsive back-office navigation. On desktop the links sit inline in the
// header (as before). On phone/tablet they collapse behind a hamburger into a
// dropdown panel so the admin is usable — and app-like — on a small screen.

export type AdminNavProps = {
  role: string;
  showAnalytics: boolean;
  showTeam: boolean;
};

type NavItem = { href: string; label: string };

function buildLinks({ showAnalytics, showTeam }: AdminNavProps): NavItem[] {
  const links: NavItem[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Produkte" },
    { href: "/admin/orders", label: "Bestellungen" },
  ];
  if (showAnalytics) {
    links.push(
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/discounts", label: "Rabatte" },
      { href: "/admin/reviews", label: "Bewertungen" },
      { href: "/admin/customers", label: "Kunden" },
      { href: "/admin/newsletter", label: "Newsletter" },
    );
  }
  if (showTeam) {
    links.push(
      { href: "/admin/team", label: "Team" },
      { href: "/admin/audit", label: "Protokoll" },
    );
  }
  links.push({ href: "/admin/account", label: "Konto" });
  return links;
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function RoleChip({ role }: { role: string }) {
  return (
    <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[9px] tracking-[0.2em] text-muted">
      {role}
    </span>
  );
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/api/admin/logout" method="POST">
      <button type="submit" className={className ?? "text-muted hover:text-foreground"}>
        Logout
      </button>
    </form>
  );
}

export function AdminNavBar(props: AdminNavProps) {
  const { role } = props;
  const links = buildLinks(props);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop — inline nav */}
      <nav className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] lg:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              isActive(pathname, l.href)
                ? "text-foreground underline underline-offset-4"
                : "text-muted hover:text-foreground hover:underline underline-offset-4"
            }
          >
            {l.label}
          </Link>
        ))}
        <RoleChip role={role} />
        <LogoutButton />
      </nav>

      {/* Mobile / tablet — role chip + hamburger */}
      <div className="flex items-center gap-3 lg:hidden">
        <RoleChip role={role} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute inset-x-0 top-full z-50 border-b border-border bg-background shadow-xl lg:hidden">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-4 sm:grid-cols-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    isActive(pathname, l.href)
                      ? "bg-muted-bg text-foreground"
                      : "text-muted hover:bg-muted-bg hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <LogoutButton className="rounded-md px-3 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:bg-muted-bg hover:text-foreground" />
            </div>
          </nav>
        </>
      )}
    </>
  );
}
