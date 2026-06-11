// Central role model, adapted from the starter kit: exactly two roles —
// "kunde" and "admin". There is no owner tier; the four team members are
// equal admins (managed in agency_admins via the team dashboard).

export type Role = "kunde" | "admin";

/** Admins reach the team dashboard; customers do not. */
export function isBackoffice(role: Role): boolean {
  return role === "admin";
}

export interface NavItem {
  href: string;
  label: string;
}

/** Role-based dashboard navigation. */
export function navFor(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/dashboard", label: "Mein Dashboard" },
      { href: "/admin", label: "Team-Dashboard" },
      { href: "/analyse", label: "KI-Analyse" },
    ];
  }
  return [
    { href: "/dashboard", label: "Mein Dashboard" },
    { href: "/analyse", label: "KI-Analyse" },
    { href: "/kontakt", label: "Kontakt" },
  ];
}
