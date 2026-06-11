import type { Role } from "./auth-context";

// Small, central permission helpers. Keep all "who can see/do what" logic here
// so the rest of the app stays declarative.

/** Owner + admin reach the back office; customers do not. */
export function isBackoffice(role: Role): boolean {
  return role === "admin" || role === "owner";
}

/** Only the owner sees finances, billing and global settings. */
export function isOwner(role: Role): boolean {
  return role === "owner";
}

/** Per-role navigation for the dashboard shell. */
export type NavItem = { href: string; label: string; icon?: string };

export function navFor(role: Role): NavItem[] {
  if (role === "owner") {
    return [
      { href: "/dashboard", label: "Übersicht", icon: "◉" },
      { href: "/dashboard/ai", label: "KI-Assistent", icon: "✦" },
      { href: "/dashboard/projects", label: "Projekte", icon: "▦" },
      { href: "/dashboard/customers", label: "Kunden", icon: "☺" },
      { href: "/dashboard/finance", label: "Finanzen", icon: "€" },
      { href: "/dashboard/settings", label: "Einstellungen", icon: "⚙" },
    ];
  }
  if (role === "admin") {
    return [
      { href: "/dashboard", label: "Übersicht", icon: "◉" },
      { href: "/dashboard/ai", label: "KI-Assistent", icon: "✦" },
      { href: "/dashboard/projects", label: "Projekte", icon: "▦" },
      { href: "/dashboard/customers", label: "Kunden", icon: "☺" },
    ];
  }
  // customer
  return [
    { href: "/dashboard", label: "Start", icon: "◉" },
    { href: "/dashboard/ai", label: "Website verbessern", icon: "✦" },
    { href: "/dashboard/projects", label: "Meine Projekte", icon: "▦" },
    { href: "/dashboard/account", label: "Konto", icon: "☺" },
  ];
}
