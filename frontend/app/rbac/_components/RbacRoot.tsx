"use client";

import { AuthProvider, type Auth } from "../_lib/auth-context";
import { Shell } from "./Shell";

// Client root: seeds the auth context with the server-resolved session and
// renders the role-appropriate shell.
export function RbacRoot({ auth }: { auth: Auth }) {
  return (
    <AuthProvider value={auth}>
      <Shell />
    </AuthProvider>
  );
}
