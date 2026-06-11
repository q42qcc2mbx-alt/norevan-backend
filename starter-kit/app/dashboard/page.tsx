import { redirect } from "next/navigation";
import { getSessionUser } from "../../lib/session";
import { AuthProvider } from "../../lib/auth-context";
import { DashboardShell } from "../../components/DashboardShell";
import { AiWebsiteHelper } from "../../components/AiWebsiteHelper";
import { DeviceChooser } from "../../components/DeviceChooser";

// Main dashboard. Server-resolves the session, feeds the role into the client
// providers, and renders the role-aware shell with the AI helper as the home.
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AuthProvider value={user}>
      <DashboardShell active="/dashboard">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Hallo {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {user.role === "customer"
              ? "Lass dir von der KI zeigen, wie du deine Website verbesserst."
              : "Übersicht & KI-Assistent für deine Kunden."}
          </p>
        </div>

        <AiWebsiteHelper />
      </DashboardShell>
      <DeviceChooser />
    </AuthProvider>
  );
}
