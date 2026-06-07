import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { resolveAuth } from "./_lib/resolve-role";
import { RbacRoot } from "./_components/RbacRoot";

export default function RbacPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Resolver />
    </Suspense>
  );
}

async function Resolver() {
  await connection(); // role depends on the live session → render per request
  const auth = await resolveAuth();
  if (!auth) return <Gate />;
  return <RbacRoot auth={auth} />;
}

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}

// Shown when nobody is signed in — routes to the correct login.
function Gate() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Norevan
        </span>
        <h1
          className="mt-2 italic"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1 }}
        >
          Anmeldung erforderlich
        </h1>
        <p className="mt-3 text-sm text-muted">
          Deine Ansicht richtet sich nach deiner Rolle. Bitte melde dich an.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/de/login"
            className="grid h-12 place-items-center rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
          >
            Als Kundin anmelden
          </Link>
          <Link
            href="/admin/login"
            className="grid h-12 place-items-center rounded-full border border-border font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
          >
            Team / Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
}
