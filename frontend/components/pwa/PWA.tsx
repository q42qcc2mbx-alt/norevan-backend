"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";

// Registers the service worker (enables "Install app") and shows a subtle
// install pill when the browser offers it (Android/Chrome). Dismissible; hidden
// once installed or declined.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "norevan_pwa_dismissed";

export function PWA({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (dismissed) return;

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!show || !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4 print:hidden">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg">
        <span className="text-sm">
          {isDe ? "Norevan als App installieren?" : "Install Norevan as an app?"}
        </span>
        <button
          type="button"
          onClick={install}
          className="rounded-full bg-foreground px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-background"
        >
          {isDe ? "Installieren" : "Install"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={isDe ? "Schließen" : "Close"}
          className="text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
