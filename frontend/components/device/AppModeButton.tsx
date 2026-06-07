"use client";

import { useDevice } from "@/lib/device-store";

// Compact icon toggle for App Mode — sits in the header (storefront & admin).
// Press it to switch the whole UI into the native-app layout (bottom tab bar,
// fixed chrome). State is shared via the persisted device store, so toggling
// here also flips the customer/admin bottom bars.
export function AppModeButton({ className }: { className?: string }) {
  const appMode = useDevice((s) => s.appMode);
  const toggleAppMode = useDevice((s) => s.toggleAppMode);

  return (
    <button
      type="button"
      onClick={toggleAppMode}
      aria-pressed={appMode}
      aria-label={appMode ? "App-Modus aus" : "App-Modus an"}
      title={appMode ? "App-Modus aus" : "App-Modus an"}
      className={
        className ??
        `inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          appMode
            ? "border-foreground bg-foreground text-background"
            : "border-border text-foreground hover:border-foreground"
        }`
      }
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    </button>
  );
}
