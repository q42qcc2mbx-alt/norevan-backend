"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { Locale } from "@/lib/i18n/config";

// First-visit newsletter popup that rewards sign-up with a 10% welcome code.
// Shows once per browser, after a short delay, and never on auth/checkout pages.
const SEEN_KEY = "norevan_nl_seen";
const CODE = "WILLKOMMEN10";

export function NewsletterPopup({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const blocked =
    pathname?.includes("/login") ||
    pathname?.includes("/auth") ||
    pathname?.includes("/checkout");

  useEffect(() => {
    if (blocked) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setShow(true), 9000);
    return () => clearTimeout(t);
  }, [blocked]);

  function close() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    } catch {
      setState("error");
    }
  }

  if (blocked) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={close}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label={isDe ? "Schließen" : "Close"}
              className="absolute right-4 top-4 text-muted hover:text-foreground"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {state === "done" ? (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
                  {isDe ? "Willkommen" : "Welcome"}
                </div>
                <h2
                  className="mt-3 italic"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", lineHeight: 1 }}
                >
                  {isDe ? "10 % geschenkt 🎉" : "10% off 🎉"}
                </h2>
                <p className="mt-3 text-sm text-muted">
                  {isDe ? "Dein Code an der Kasse:" : "Your code at checkout:"}
                </p>
                <div className="mt-3 select-all rounded-lg border border-dashed border-foreground px-4 py-3 font-mono text-lg tracking-[0.2em]">
                  {CODE}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 h-11 w-full rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background"
                >
                  {isDe ? "Weiter shoppen" : "Keep shopping"}
                </button>
              </>
            ) : (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
                  Norevan
                </div>
                <h2
                  className="mt-3 italic"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", lineHeight: 1 }}
                >
                  {isDe ? "10 % auf deine erste Bestellung" : "10% off your first order"}
                </h2>
                <p className="mt-3 text-sm text-muted">
                  {isDe
                    ? "Trag dich für den Newsletter ein und bekomme sofort deinen Code."
                    : "Join the newsletter and get your code instantly."}
                </p>
                <form onSubmit={submit} className="mt-5 space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    placeholder={isDe ? "deine@email.de" : "you@email.com"}
                    className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm focus:border-foreground focus:outline-none"
                  />
                  {state === "error" && (
                    <p className="text-xs text-red-500">
                      {isDe ? "Bitte gültige E-Mail eingeben." : "Please enter a valid email."}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="h-12 w-full rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {state === "loading"
                      ? isDe ? "Wird gesendet…" : "Sending…"
                      : isDe ? "Code sichern" : "Get my code"}
                  </button>
                </form>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  {isDe ? "Jederzeit abbestellbar" : "Unsubscribe anytime"}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
