"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useConsent } from "@/lib/consent";
import type { Locale } from "@/lib/i18n/config";

export function CookieConsent({ locale }: { locale: Locale }) {
  const status = useConsent((s) => s.status);
  const accept = useConsent((s) => s.accept);
  const decline = useConsent((s) => s.decline);
  const [mounted, setMounted] = useState(false);
  const isDe = locale === "de";

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted || status !== "unset") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        role="dialog"
        aria-label={isDe ? "Cookie-Hinweis" : "Cookie notice"}
        className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur-md md:inset-x-auto md:right-4 md:left-auto md:w-[420px]"
      >
        <p className="text-sm leading-relaxed text-foreground/85">
          {isDe
            ? "Wir messen anonyme Besuche, um den Shop zu verbessern — ohne IP-Speicherung und ohne Drittanbieter-Cookies."
            : "We measure anonymous visits to improve the shop — no IP storage, no third-party cookies."}{" "}
          <Link
            href={`/${locale}/legal/datenschutz`}
            className="underline underline-offset-2 hover:text-foreground"
          >
            {isDe ? "Mehr erfahren" : "Learn more"}
          </Link>
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={accept}
            className="h-10 flex-1 rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
          >
            {isDe ? "Akzeptieren" : "Accept"}
          </button>
          <button
            type="button"
            onClick={decline}
            className="h-10 flex-1 rounded-full border border-border font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
          >
            {isDe ? "Ablehnen" : "Decline"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
