"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll to the top on every route change. Without this, Lenis keeps
  // the previous page's scroll offset (e.g. landing mid-way down a product page
  // after clicking an item further down the shop list). Anchor links (#hash)
  // are left untouched so in-page jumps still work.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
