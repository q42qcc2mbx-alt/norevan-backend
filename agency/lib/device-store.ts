"use client";

import { useEffect, useState } from "react";

// Device preference (Handy / Tablet / Laptop / PC) persisted in localStorage.
// Auto-detects on first visit; the visitor can override via <DeviceChooser>.
// Phones & tablets enable "app mode": data-device + data-app-mode land on
// <html> so CSS reacts and the bottom <AppNavBar> appears.

export type Device = "phone" | "tablet" | "laptop" | "desktop";

// Bumped to v3 for the 4-device schema (re-asks once after the upgrade).
const KEY = "norevan_device3";

export function isAppModeDevice(d: Device | null): boolean {
  return d === "phone" || d === "tablet";
}

export function detectDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const w = window.innerWidth;
  const tablet =
    /ipad/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua)) || (touch && w >= 768 && w < 1024);
  if (tablet) return "tablet";
  if (/iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua) || (touch && w < 768)) {
    return "phone";
  }
  return w < 1440 ? "laptop" : "desktop";
}

function applyToHtml(d: Device) {
  const html = document.documentElement;
  html.dataset.device = d;
  if (isAppModeDevice(d)) html.dataset.appMode = "1";
  else delete html.dataset.appMode;
}

export function getStoredDevice(): Device | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "phone" || v === "tablet" || v === "laptop" || v === "desktop" ? v : null;
  } catch {
    return null;
  }
}

export function setStoredDevice(d: Device) {
  try {
    localStorage.setItem(KEY, d);
    applyToHtml(d);
  } catch {
    /* ignore */
  }
}

/** Chosen device + setter; null until mounted (SSR-safe). App mode is applied
 *  for the effective device (detected or chosen) so phones feel app-like right
 *  away. */
export function useDevice(): {
  device: Device | null;
  chosen: boolean;
  choose: (d: Device) => void;
} {
  const [state, setState] = useState<{ device: Device; chosen: boolean } | null>(null);

  useEffect(() => {
    const stored = getStoredDevice();
    // requestAnimationFrame defers the state write out of the effect body
    // (lint: react-hooks/set-state-in-effect) — visually identical.
    const frame = requestAnimationFrame(() => {
      const d = stored ?? detectDevice();
      applyToHtml(d);
      setState({ device: d, chosen: Boolean(stored) });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function choose(d: Device) {
    setStoredDevice(d);
    setState({ device: d, chosen: true });
  }

  return { device: state?.device ?? null, chosen: state?.chosen ?? false, choose };
}
