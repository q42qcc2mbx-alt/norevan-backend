"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDevice, detectDevice, type DeviceType } from "@/lib/device-store";
import type { Locale } from "@/lib/i18n/config";

// One-time bottom sheet shown on the first visit: it asks the visitor what
// they're browsing on. Detection has already run (DeviceProvider), so the
// matching option is highlighted as "Erkannt" — they just confirm, or switch.
// Picking a phone/tablet turns on App Mode automatically.

type Option = {
  type: DeviceType;
  de: string;
  en: string;
  icon: React.ReactNode;
};

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}
function TabletIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}
function LaptopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="11" rx="1.5" />
      <path d="M2 20h20l-1.5-3H3.5L2 20Z" />
    </svg>
  );
}
function DesktopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="13" rx="1.5" />
      <path d="M8 21h8M12 16v5" />
    </svg>
  );
}

const OPTIONS: Option[] = [
  { type: "mobile", de: "Handy", en: "Phone", icon: <PhoneIcon /> },
  { type: "tablet", de: "Tablet / iPad", en: "Tablet / iPad", icon: <TabletIcon /> },
  { type: "laptop", de: "Laptop", en: "Laptop", icon: <LaptopIcon /> },
  { type: "desktop", de: "PC", en: "PC", icon: <DesktopIcon /> },
];

export function DeviceChooser({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const chosen = useDevice((s) => s.chosen);
  const setDevice = useDevice((s) => s.setDevice);
  const [mounted, setMounted] = useState(false);
  const [detected, setDetected] = useState<DeviceType>("desktop");

  useEffect(() => {
    // Small delay so we don't pop simultaneously with the welcome gate.
    const t = setTimeout(() => {
      setDetected(detectDevice());
      setMounted(true);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const show = mounted && !chosen;

  function pick(type: DeviceType) {
    setDevice(type, { chosen: true });
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            key="dc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={() => pick(detected)}
          />
          <motion.div
            key="dc-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={isDe ? "Gerät wählen" : "Choose your device"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-x-0 bottom-0 z-[81] mx-auto w-full max-w-md rounded-t-2xl border border-border bg-card p-6 shadow-2xl"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
            <h2 className="headline text-xl">
              {isDe ? "Worauf bist du gerade?" : "What are you browsing on?"}
            </h2>
            <p className="body-soft mt-2 text-sm leading-relaxed">
              {isDe
                ? "Damit wir die Ansicht perfekt anpassen. Auf Handy & Tablet gibt's einen App-Modus, der sich wie eine echte App anfühlt."
                : "So we can tailor the view. On phone & tablet you get App Mode — it feels just like a native app."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {OPTIONS.map((o) => {
                const isDetected = o.type === detected;
                return (
                  <button
                    key={o.type}
                    type="button"
                    onClick={() => pick(o.type)}
                    className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      isDetected
                        ? "border-foreground bg-muted-bg"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <span className="text-foreground">{o.icon}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {isDe ? o.de : o.en}
                    </span>
                    {isDetected && (
                      <span className="absolute right-3 top-3 font-mono text-[8px] uppercase tracking-[0.2em] text-muted">
                        {isDe ? "Erkannt" : "Detected"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => pick(detected)}
              className="mt-4 w-full text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
            >
              {isDe ? "Überspringen" : "Skip"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
