"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string; icon: keyof typeof ICONS; show: boolean };
type Group = { heading: string; items: Item[] };

const ICONS = {
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  orders: "M6 2l1.5 2h9L18 2M3 6h18l-1.5 13.5a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 6zm6 5h6",
  products: "M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7L12 12l8.7-5M12 22V12",
  discount: "M9 9h.01M15 15h.01M16 8l-8 8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  reviews: "M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.8 5.5 21l2-7.5L2 9h7z",
  analytics: "M3 3v18h18M7 14l3-3 3 3 4-5",
  team: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  audit: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  account: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
} as const;

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Inhaber",
  admin: "Admin",
  staff: "Mitarbeiter",
  viewer: "Leser",
};

export function AdminSidebar({ role, email }: { role: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin" || role === "owner";
  const isOwner = role === "owner";

  const groups: Group[] = [
    {
      heading: "Übersicht",
      items: [{ href: "/admin", label: "Dashboard", icon: "dashboard", show: true }],
    },
    {
      heading: "Shop",
      items: [
        { href: "/admin/orders", label: "Bestellungen", icon: "orders", show: true },
        { href: "/admin/products", label: "Produkte", icon: "products", show: true },
        { href: "/admin/discounts", label: "Rabatte", icon: "discount", show: isAdmin },
        { href: "/admin/reviews", label: "Bewertungen", icon: "reviews", show: isAdmin },
      ],
    },
    {
      heading: "Insights",
      items: [{ href: "/admin/analytics", label: "Analytics", icon: "analytics", show: isAdmin }],
    },
    {
      heading: "Organisation",
      items: [
        { href: "/admin/team", label: "Team", icon: "team", show: isOwner },
        { href: "/admin/audit", label: "Protokoll", icon: "audit", show: isOwner },
        { href: "/admin/account", label: "Konto", icon: "account", show: true },
      ],
    },
  ];

  function active(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groups.map((g) => {
        const items = g.items.filter((i) => i.show);
        if (items.length === 0) return null;
        return (
          <div key={g.heading}>
            <div className="mb-1 px-3 font-mono text-[9px] uppercase tracking-[0.3em] text-muted">
              {g.heading}
            </div>
            <ul className="flex flex-col gap-0.5">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active(it.href)
                        ? "bg-foreground text-background"
                        : "text-foreground/75 hover:bg-muted-bg hover:text-foreground",
                    )}
                  >
                    <Icon d={ICONS[it.icon]} />
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-border-subtle p-3">
      <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-xs text-foreground">{email}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
            {ROLE_LABEL[role] ?? role}
          </div>
        </div>
        <ThemeToggle label="Theme" />
      </div>
      <form action="/api/admin/logout" method="POST" className="mt-1 px-3">
        <button
          type="submit"
          className="w-full rounded-lg py-2 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
        >
          Abmelden
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-5 py-5">
      <span className="font-serif text-xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        Nor<em className="not-italic" style={{ color: "var(--gold)" }}>e</em>van
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted">Studio</span>
    </Link>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menü öffnen"
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted-bg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span className="font-serif text-lg" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
          Nor<em className="not-italic" style={{ color: "var(--gold)" }}>e</em>van
        </span>
        <ThemeToggle label="Theme" />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border bg-card md:hidden"
            >
              {brand}
              {nav}
              {footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
