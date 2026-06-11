"use client";

import { createContext, useContext } from "react";

// ── Roles ────────────────────────────────────────────────────────────────
// Three roles power the whole app. The role comes from your backend session
// (resolve it server-side and pass it into <AuthProvider>).
export type Role = "customer" | "admin" | "owner";

export const ROLE_LABEL: Record<Role, string> = {
  customer: "Kunde",
  admin: "Admin",
  owner: "Owner",
};

export type AuthUser = {
  role: Role;
  name: string;
  email: string;
};

const AuthContext = createContext<AuthUser | null>(null);

/** Wrap your app (or dashboard) with this, feeding the server-resolved user. */
export function AuthProvider({
  value,
  children,
}: {
  value: AuthUser;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthUser {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
