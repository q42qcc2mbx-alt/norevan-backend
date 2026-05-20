"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 200, damping: 32, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: x, transformOrigin: "0% 50%" }}
      className="pointer-events-none fixed left-0 right-0 top-0 z-40 h-px bg-[var(--gold)]"
    />
  );
}
