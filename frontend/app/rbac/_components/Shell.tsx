"use client";

import { useState } from "react";
import { useAuth, ROLE_META } from "../_lib/auth-context";
import { NAV, ALLOWED_KEYS } from "../_lib/nav";
import { RoleSwitcher } from "./RoleSwitcher";
import { CustomerView } from "./CustomerView";
import { AdminView } from "./AdminView";
import { OwnerView } from "./OwnerView";

// Main layout. Holds the active nav key and renders exactly one role's view.
// The "protected route" guard: if the active key isn't in the current role's
// allow-list (e.g. right after a role switch), it falls back to that role's
// first page — a role can never render another role's screen.

export function Shell() {
  const { role, person } = useAuth();
  const [active, setActive] = useState("home");

  const items = NAV[role];
  const effectiveActive = ALLOWED_KEYS[role].has(active) ? active : items[0].key;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">Norevan</span>
            <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.15rem" }} className="italic">
              {role === "customer" ? "shop" : role === "admin" ? "admin" : "owner"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs">{person}</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                {ROLE_META[role].tagline}
              </span>
            </span>
            <RoleSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile nav (horizontal scroll) */}
      <div className="border-b border-border md:hidden">
        <nav className="flex gap-2 overflow-x-auto px-4 py-3">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setActive(it.key)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors ${
                effectiveActive === it.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted"
              }`}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex max-w-7xl md:gap-8 md:px-8">
        {/* Sidebar nav (per role) */}
        <aside className="hidden w-52 shrink-0 py-8 md:block">
          <nav className="sticky top-20 space-y-1">
            {items.map((it) => (
              <button
                key={it.key}
                onClick={() => setActive(it.key)}
                className={`block w-full rounded-md px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  effectiveActive === it.key
                    ? "bg-muted-bg text-foreground"
                    : "text-muted hover:bg-muted-bg hover:text-foreground"
                }`}
              >
                {it.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content — exactly one role's view */}
        <main className="min-w-0 flex-1 px-4 py-8 md:px-0">
          {role === "customer" && <CustomerView active={effectiveActive} />}
          {role === "admin" && <AdminView active={effectiveActive} />}
          {role === "owner" && <OwnerView active={effectiveActive} />}
        </main>
      </div>
    </div>
  );
}
