"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/**
 * DSGVO/TTDSG-konformer Cookie-Hinweis — unaufdringlich (schmaler Balken unten,
 * blockiert den Inhalt nicht). Zwei gleichwertige Buttons: „Nur notwendige" ist
 * NICHT versteckt/ausgegraut (sonst kein gültiger Consent). Die Wahl wird in
 * localStorage gespeichert; die Reichweitenmessung (Vercel) ist cookielos &
 * anonym, daher technisch ohne Einwilligung zulässig — der Hinweis schafft
 * Transparenz und merkt sich die Entscheidung für künftiges Tracking.
 */
const KEY = "norevan-cookie-consent";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Short delay so the banner eases in after the page settles (and so the
    // state update happens in a timer callback, not synchronously in the effect).
    const id = setTimeout(() => {
      try {
        if (!localStorage.getItem(KEY)) setShow(true);
      } catch {
        /* localStorage unavailable — stay silent */
      }
    }, 800);
    return () => clearTimeout(id);
  }, []);

  function choose(value: "all" | "essential") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-edge bg-page/95 backdrop-blur-xl"
          role="dialog"
          aria-label="Cookie-Hinweis"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <p className="text-sm leading-relaxed text-ink-soft">
              Wir nutzen nur technisch notwendige Cookies und eine anonyme, cookielose
              Reichweitenmessung (Server in der EU).{" "}
              <Link href="/datenschutz" className="font-medium text-accent hover:underline">
                Mehr erfahren
              </Link>
            </p>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={() => choose("essential")}
                className="btn-secondary rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={() => choose("all")}
                className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
