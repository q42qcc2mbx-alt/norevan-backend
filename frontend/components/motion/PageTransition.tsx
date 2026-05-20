"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Re-mounts on pathname change so the fade-in plays. Avoids AnimatePresence +
 * exit because that combination intermittently leaves the previous <main>
 * stuck at opacity:0 with the App Router (no clean unmount signal).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex-1"
    >
      {children}
    </motion.main>
  );
}
