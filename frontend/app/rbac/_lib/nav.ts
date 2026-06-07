import type { Role } from "./auth-context";

// Per-role navigation. The `key` selects which panel renders inside the shell —
// this is the heart of the RBAC: a role can only ever reach its own keys.
export type NavItem = { key: string; label: string };

export const NAV: Record<Role, NavItem[]> = {
  customer: [
    { key: "home", label: "Startseite" },
    { key: "shop", label: "Shop" },
    { key: "cart", label: "Warenkorb" },
    { key: "profile", label: "Mein Profil" },
  ],
  admin: [
    { key: "dashboard", label: "Dashboard" },
    { key: "orders", label: "Bestellungen" },
    { key: "support", label: "Kundensupport" },
    { key: "inventory", label: "Lagerbestand" },
  ],
  owner: [
    { key: "overview", label: "Übersicht" },
    { key: "finance", label: "Finanzen" },
    { key: "analytics", label: "Analytics" },
    { key: "team", label: "Mitarbeiter" },
    { key: "operations", label: "Operatives" }, // super-user → admin tools
  ],
};

// Every key any role is allowed to see. Used by the shell to block access if a
// stale key survives a role switch (simulated protected route).
export const ALLOWED_KEYS: Record<Role, Set<string>> = {
  customer: new Set(NAV.customer.map((n) => n.key)),
  admin: new Set(NAV.admin.map((n) => n.key)),
  owner: new Set(NAV.owner.map((n) => n.key)),
};
