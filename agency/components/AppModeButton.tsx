"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Maximize, Minimize, Share, X } from "lucide-react";

// Mobile-only button that switches the site into an app-like FULLSCREEN view
// (no install) via the Fullscreen API — browser bars disappear, so it feels
// like a real app. On Android/Chrome this works directly; iOS Safari has no
// element-fullscreen API, so we show the (only) iOS path: Add to Home Screen.

type FsDoc = Document & {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
};
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

export default function AppModeButton() {
  const [isFs, setIsFs] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const d = document as FsDoc;
      setIsFs(Boolean(document.fullscreenElement || d.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  function toggle() {
    const d = document as FsDoc;
    const el = document.documentElement as FsEl;
    const current = document.fullscreenElement || d.webkitFullscreenElement;
    if (current) {
      const exit = document.exitFullscreen?.bind(document) ?? d.webkitExitFullscreen?.bind(d);
      exit?.();
      return;
    }
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    if (req) {
      Promise.resolve(req()).catch(() => setIosHint(true));
    } else {
      setIosHint(true); // iOS Safari — no element fullscreen
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-[55] sm:hidden">
      <AnimatePresence>
        {iosHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="card-elevated mb-2 w-64 p-3.5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs leading-relaxed text-ink-soft">
                Auf dem iPhone: unten auf <Share className="inline h-4 w-4 text-accent" /> tippen und
                „Zum Home-Bildschirm“ wählen — dann öffnet die Seite im App-Modus.
              </p>
              <button
                type="button"
                onClick={() => setIosHint(false)}
                aria-label="Schließen"
                className="shrink-0 rounded-lg p-1 text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        aria-label={isFs ? "App-Modus beenden" : "App-Modus starten"}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-accent to-cyan-glow px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30"
      >
        {isFs ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        {isFs ? "Beenden" : "App-Modus"}
      </button>
    </div>
  );
}
