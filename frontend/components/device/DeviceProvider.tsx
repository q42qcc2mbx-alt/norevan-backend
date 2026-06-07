"use client";

import { useEffect } from "react";
import { useDevice, detectDevice } from "@/lib/device-store";

/**
 * Runs device detection once on mount (unless the visitor already picked a
 * device) and mirrors the resolved device + App Mode onto <html> as data
 * attributes so CSS can react (e.g. bottom-bar padding, safe-area insets).
 * Renders nothing.
 */
export function DeviceProvider() {
  const device = useDevice((s) => s.device);
  const chosen = useDevice((s) => s.chosen);
  const appMode = useDevice((s) => s.appMode);
  const setDevice = useDevice((s) => s.setDevice);

  // Auto-detect on first load. If the visitor confirmed a device before, we
  // trust their choice and skip detection.
  useEffect(() => {
    if (!chosen) setDevice(detectDevice());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    if (device) el.setAttribute("data-device", device);
    el.setAttribute("data-app-mode", appMode ? "on" : "off");
  }, [device, appMode]);

  return null;
}
