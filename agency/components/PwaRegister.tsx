"use client";

import { useEffect } from "react";

/** Registers the service worker (production only) to enable PWA install. */
export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failure is non-fatal */
    });
  }, []);
  return null;
}
