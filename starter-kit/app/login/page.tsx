import { redirect } from "next/navigation";
import { LoginForm } from "../../components/LoginForm";
import { DeviceChooser } from "../../components/DeviceChooser";
import { getSessionUser } from "../../lib/session";

// Public login page. If already signed in, go straight to the dashboard.
export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
      <LoginForm />
      <DeviceChooser />
    </main>
  );
}
