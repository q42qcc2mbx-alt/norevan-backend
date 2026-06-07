"use client";

import { createContext, useContext, useState } from "react";

// ── Roles ──────────────────────────────────────────────────────────────────
export type Role = "customer" | "admin" | "owner";

export const ROLE_META: Record<
  Role,
  { label: string; person: string; email: string; tagline: string }
> = {
  customer: {
    label: "Kundin",
    person: "Lena Vogt",
    email: "lena@example.com",
    tagline: "Shoppen & Bestellungen",
  },
  admin: {
    label: "Admin",
    person: "Nina S.",
    email: "nina@norevan.shop",
    tagline: "Tagesgeschäft & Support",
  },
  owner: {
    label: "Owner",
    person: "Ahmad A.",
    email: "owner@norevan.shop",
    tagline: "Zahlen & Strategie",
  },
};

type AuthState = {
  role: Role;
  setRole: (r: Role) => void;
  person: string;
  email: string;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("customer");
  const meta = ROLE_META[role];
  return (
    <AuthContext.Provider
      value={{ role, setRole, person: meta.person, email: meta.email }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
