"use client";

import { useEffect, useState } from "react";

// Device preference (Handy / Tablet / Computer) persisted in localStorage.
// Auto-detects on first visit; the visitor can override via <DeviceChooser>.
// The chosen device is exposed as data-device on <html> for CSS hooks.

export type Device = "phone" | "tablet" | "desktop";

const KEY = "norevan_device";

export function detectDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (w < 768) return "phone";
  if (w < 1024 && touch) return "tablet";
  return "desktop";
}

export function getStoredDevice(): Device | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "phone" || v === "tablet" || v === "desktop" ? v : null;
  } catch {
    return null;
  }
}

export function setStoredDevice(d: Device) {
  try {
    localStorage.setItem(KEY, d);
    document.documentElement.dataset.device = d;
  } catch {
    /* ignore */
  }
}

/** Hook returning the chosen device + a setter; null until mounted (SSR-safe). */
export function useDevice(): {
  device: Device | null;
  chosen: boolean;
  choose: (d: Device) => void;
} {
  // null until mounted; afterwards { device, chosen } reflects storage.
  const [state, setState] = useState<{ device: Device; chosen: boolean } | null>(null);

  useEffect(() => {
    const stored = getStoredDevice();
    // requestAnimationFrame defers the state write out of the effect body
    // (lint: react-hooks/set-state-in-effect) — visually identical.
    const frame = requestAnimationFrame(() => {
      if (stored) {
        document.documentElement.dataset.device = stored;
        setState({ device: stored, chosen: true });
      } else {
        setState({ device: detectDevice(), chosen: false });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function choose(d: Device) {
    setStoredDevice(d);
    setState({ device: d, chosen: true });
  }

  return { device: state?.device ?? null, chosen: state?.chosen ?? false, choose };
}
