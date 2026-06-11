"use client";

import { useEffect, useState } from "react";

// Lightweight device preference (phone / tablet / desktop) persisted in
// localStorage — no external state library needed. Auto-detects on first visit;
// the user can override it via <DeviceChooser>.

export type Device = "phone" | "tablet" | "desktop";

const KEY = "app_device";

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
  const [device, setDevice] = useState<Device | null>(null);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    const stored = getStoredDevice();
    if (stored) {
      setDevice(stored);
      setChosen(true);
      document.documentElement.dataset.device = stored;
    } else {
      setDevice(detectDevice());
    }
  }, []);

  function choose(d: Device) {
    setStoredDevice(d);
    setDevice(d);
    setChosen(true);
  }

  return { device, chosen, choose };
}
