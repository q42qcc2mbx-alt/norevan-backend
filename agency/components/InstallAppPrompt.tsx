"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Share, Smartphone, X } from "lucide-react";

// Mobile "install as app" banner with one clear button.
//  • Android/Chrome: captures `beforeinstallprompt` → the button triggers the
//    native install dialog.
//  • iPhone (Safari): no install API exists, so we show the manual
//    "Teilen → Zum Home-Bildschirm" steps.
//  • Anything else without a native prompt: the button reveals the manual steps.
// Shown on phones only, when not already installed; dismiss lasts for the
// session (so it reappears on the next visit rather than nagging on every tap).

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "norevan-install-dismissed";

export default function InstallAppPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return; // already installed
    if (!window.matchMedia("(max-width: 820px)").matches) return; // phones only
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    const timer = setTimeout(() => {
      setIsIOS(ios);
      setShow(true);
    }, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  async function install() {
    const ev = deferred.current;
    if (ev) {
      await ev.prompt();
      try {
        await ev.userChoice;
      } catch {
        /* ignore */
      }
      deferred.current = null;
      dismiss();
      return;
    }
    // No native install dialog available → show the manual steps.
    setShowSteps(true);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-3 z-[60] sm:hidden"
          role="dialog"
          aria-label="App installieren"
        >
          <div className="card-elevated p-3.5 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow text-white">
                <Smartphone className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">NOREVAN als App</p>
                <p className="text-xs text-ink-muted">Direkt vom Startbildschirm öffnen.</p>
              </div>
              {!isIOS && (
                <button
                  type="button"
                  onClick={install}
                  className="btn-primary inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold"
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

            {(isIOS || showSteps) && (
              <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-card px-3 py-2.5 text-xs leading-relaxed text-ink-soft ring-1 ring-edge">
                {isIOS ? (
                  <>
                    Tippen Sie unten auf <Share className="inline h-4 w-4 text-accent" /> und dann auf
                    „Zum Home-Bildschirm“.
                  </>
                ) : (
                  <>Öffnen Sie das Browser-Menü (⋮) und tippen Sie auf „App installieren“ bzw. „Zum
                    Startbildschirm hinzufügen“.</>
                )}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
