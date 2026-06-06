"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// What the visitor is browsing on. "laptop" and "desktop" behave the same in
// the UI — we keep them apart only because the entry chooser offers both and
// some people care about the label. Touch form factors (mobile/tablet) are the
// ones that unlock "App Mode".
export type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

export const isTouchDevice = (d: DeviceType | null) =>
  d === "mobile" || d === "tablet";

type DeviceState = {
  /** Resolved device — null until detection runs / a choice is restored. */
  device: DeviceType | null;
  /** True once the visitor explicitly confirmed their device in the chooser. */
  chosen: boolean;
  /** App-like chrome (bottom tab bar, condensed header) is active. */
  appMode: boolean;
  setDevice: (d: DeviceType, opts?: { chosen?: boolean }) => void;
  setAppMode: (on: boolean) => void;
  toggleAppMode: () => void;
};

export const useDevice = create<DeviceState>()(
  persist(
    (set) => ({
      device: null,
      chosen: false,
      appMode: false,
      setDevice: (device, opts) =>
        set((s) => {
          const confirmed = opts?.chosen ?? s.chosen;
          // Touch devices default to App Mode the moment the visitor confirms
          // their device; desktop/laptop never auto-enable it.
          const appMode = isTouchDevice(device)
            ? confirmed
              ? true
              : s.appMode
            : false;
          return { device, chosen: confirmed, appMode };
        }),
      setAppMode: (appMode) => set({ appMode }),
      toggleAppMode: () => set((s) => ({ appMode: !s.appMode })),
    }),
    { name: "norevan-device-v1" },
  ),
);

/**
 * Best-effort device detection from user-agent + viewport + touch points.
 * Returns one of the four labels; laptop vs. desktop is unknowable from the
 * browser, so non-touch always resolves to "desktop" (the chooser lets the
 * visitor switch to "laptop" if they prefer).
 */
export function detectDevice(): DeviceType {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const touch = navigator.maxTouchPoints ?? 0;
  const width = typeof window !== "undefined" ? window.innerWidth : 1280;

  const isIpadOS = /Macintosh/.test(ua) && touch > 1; // iPadOS reports as Mac
  const isTablet =
    /iPad/.test(ua) || isIpadOS || (/Android/.test(ua) && !/Mobile/.test(ua));
  const isPhone = /iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry/.test(ua);

  if (isPhone) return "mobile";
  if (isTablet) return "tablet";
  if (width < 768) return "mobile";
  if (touch > 0 && width < 1180) return "tablet";
  return "desktop";
}
