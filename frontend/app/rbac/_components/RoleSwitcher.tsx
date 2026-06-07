"use client";

import { useAuth, ROLE_META, type Role } from "../_lib/auth-context";

const ROLES: Role[] = ["customer", "admin", "owner"];

// Always-visible role switcher in the header — flip between roles to verify the
// RBAC instantly. (In production this would be the real signed-in role.)
export function RoleSwitcher() {
  const { role, setRole } = useAuth();
  return (
    <div
      role="group"
      aria-label="Rolle wechseln"
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5"
    >
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRole(r)}
          aria-pressed={role === r}
          className={`rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors ${
            role === r ? "bg-foreground text-background" : "text-muted hover:text-foreground"
          }`}
        >
          {ROLE_META[r].label}
        </button>
      ))}
    </div>
  );
}
