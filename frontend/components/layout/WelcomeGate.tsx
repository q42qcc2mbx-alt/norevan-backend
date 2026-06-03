"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n/config";

// Shown once per browser session to logged-out visitors when they enter the
// site: invites them to sign in, but lets them continue as a guest. Mirrors the
// CookieConsent pattern (client-only, session-persisted dismissal).
const SEEN_KEY = "norevan_welcome_seen";

export function WelcomeGate({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const isDe = locale === "de";

  // Never gate the auth pages themselves.
  const onAuthPage =
    pathname?.includes("/login") || pathname?.includes("/auth");

  useEffect(() => {
    if (onAuthPage) return;
    let active = true;

    // Already dismissed this session? stay hidden.
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      // sessionStorage unavailable (private mode) — show once, can't persist.
    }

    // Logged-in users never see the gate.
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (active && !data.session) setShow(true);
      })
      .catch(() => {
        if (active) setShow(true);
      });

    return () => {
      active = false;
    };
  }, [onAuthPage]);

  function dismiss() {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (onAuthPage) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={isDe ? "Willkommen bei Norevan" : "Welcome to Norevan"}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-2xl"
          >
            <Image
              src="/logo/norevan-shield.png"
              alt="Norevan"
              width={56}
              height={56}
              className="mx-auto mb-5 h-14 w-14 object-contain"
            />
            <h2 className="headline text-2xl">
              {isDe ? "Willkommen bei Norevan" : "Welcome to Norevan"}
            </h2>
            <p className="body-soft mx-auto mt-3 max-w-xs text-sm leading-relaxed">
              {isDe
                ? "Melde dich an für Wunschliste, schnellere Bestellungen und frühen Zugang zu Drops — oder schau dich einfach als Gast um."
                : "Sign in for your wishlist, faster checkout and early access to drops — or just keep browsing as a guest."}
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <Link
                href={`/${locale}/login`}
                onClick={dismiss}
                className="grid h-12 place-items-center rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
              >
                {isDe ? "Anmelden / Registrieren" : "Sign in / Register"}
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="grid h-12 place-items-center rounded-full border border-border font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
              >
                {isDe ? "Als Gast fortfahren" : "Continue as guest"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
