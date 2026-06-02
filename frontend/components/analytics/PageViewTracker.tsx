"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/consent";

/** Anonymous, per-session id (rotates when the tab session ends). */
function sessionId(): string | undefined {
  try {
    const key = "nrv_sid";
    let v = sessionStorage.getItem(key);
    if (!v) {
      v = crypto.randomUUID();
      sessionStorage.setItem(key, v);
    }
    return v;
  } catch {
    return undefined;
  }
}

function referrer(): string {
  try {
    const ref = document.referrer;
    if (!ref) return "direct";
    const u = new URL(ref);
    return u.host === location.host ? "internal" : u.hostname;
  } catch {
    return "direct";
  }
}

/**
 * Fires a best-effort beacon to /api/track on every client-side route change
 * (and the initial load). No-ops gracefully if anything is unavailable.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const consent = useConsent((s) => s.status);
  const last = useRef<string | null>(null);

  useEffect(() => {
    // Only track once the visitor has accepted the cookie notice.
    if (consent !== "accepted") return;
    if (!pathname || last.current === pathname) return;
    last.current = pathname;

    const body = JSON.stringify({
      path: pathname,
      referrer: referrer(),
      sessionId: sessionId(),
    });

    try {
      if (typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" }),
        );
      } else {
        void fetch("/api/track", {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        });
      }
    } catch {
      // ignore
    }
  }, [pathname, consent]);

  return null;
}
