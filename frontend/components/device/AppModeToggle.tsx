"use client";

import { useDevice } from "@/lib/device-store";
import type { Locale } from "@/lib/i18n/config";

// Lets the visitor flip App Mode on/off from the mobile menu. Styled to match
// the drawer's secondary actions.
export function AppModeToggle({ locale }: { locale: Locale }) {
  const appMode = useDevice((s) => s.appMode);
  const toggleAppMode = useDevice((s) => s.toggleAppMode);
  const isDe = locale === "de";

  return (
    <button
      type="button"
      onClick={toggleAppMode}
      aria-pressed={appMode}
      className="mono flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/50 transition-colors hover:text-foreground uppercase tracking-widest"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
      {isDe ? "App-Modus" : "App mode"}
      <span
        className={`ml-auto flex h-5 w-9 items-center rounded-full border px-0.5 transition-colors ${
          appMode ? "justify-end border-foreground bg-foreground" : "justify-start border-border"
        }`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full transition-colors ${
            appMode ? "bg-background" : "bg-foreground/40"
          }`}
        />
      </span>
    </button>
  );
}
