"use client";

import { createContext, useContext } from "react";

// ── Roles ──────────────────────────────────────────────────────────────────
export type Role = "customer" | "admin" | "owner";

export const ROLE_META: Record<Role, { label: string; tagline: string }> = {
  customer: { label: "Kundin", tagline: "Shoppen & Bestellungen" },
  admin: { label: "Admin", tagline: "Tagesgeschäft & Support" },
  owner: { label: "Owner", tagline: "Zahlen & Strategie" },
};

export type Auth = { role: Role; person: string; email: string };

const AuthContext = createContext<Auth | null>(null);

// The role now comes from the real session (resolved on the server and passed
// in) — there is no client-side role switching.
export function AuthProvider({
  value,
  children,
}: {
  value: Auth;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
