"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Share, Smartphone, X } from "lucide-react";

// Mobile "install as app" prompt. Android/Chrome fires `beforeinstallprompt`,
// which we capture and trigger on tap. iOS Safari has no such API, so we show
// the manual "Teilen → Zum Home-Bildschirm" hint instead. Shown once, only on
// phones, only after the cookie choice, and dismissible.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "norevan-install-dismissed";
const COOKIE_KEY = "norevan-cookie-consent";

export default function InstallAppPrompt() {
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return; // already installed
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return;
    }
    if (!window.matchMedia("(max-width: 820px)").matches) return; // phones only

    let timer: ReturnType<typeof setTimeout>;
    const showWhenReady = (m: "android" | "ios") => {
      const tryShow = () => {
        let consent = false;
        try {
          consent = Boolean(localStorage.getItem(COOKIE_KEY));
        } catch {
          /* ignore */
        }
        if (consent) setMode(m);
        else timer = setTimeout(tryShow, 1200);
      };
      tryShow();
    };

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
      showWhenReady("android");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIOS) showWhenReady("ios");

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setMode(null);
  }

  async function install() {
    const ev = deferred.current;
    if (!ev) return;
    await ev.prompt();
    try {
      await ev.userChoice;
    } catch {
      /* ignore */
    }
    deferred.current = null;
    dismiss();
  }

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-3 z-[60] sm:hidden"
          role="dialog"
          aria-label="App installieren"
        >
          <div className="card-elevated flex items-center gap-3 p-3.5 shadow-2xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow text-white">
              <Smartphone className="h-5.5 w-5.5" />
            </span>
            <div className="min-w-0 flex-1">
              {mode === "android" ? (
                <>
                  <p className="text-sm font-semibold text-ink">NOREVAN als App installieren</p>
                  <p className="text-xs text-ink-muted">Schneller Zugriff direkt vom Startbildschirm.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-ink">Zum Startbildschirm hinzufügen</p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    Tippen Sie auf <Share className="inline h-3.5 w-3.5" /> und dann „Zum
                    Home-Bildschirm“.
                  </p>
                </>
              )}
            </div>
            {mode === "android" && (
              <button
                type="button"
                onClick={install}
                className="btn-primary inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Installieren
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Schließen"
              className="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-card hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
