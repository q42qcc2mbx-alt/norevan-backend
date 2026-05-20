"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  function handle(e: MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onMouseMove={handle}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium",
        "bg-accent text-accent-foreground transition-colors",
        "hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

// ─── Link variant — same magnetic spring but renders as <a> via Next Link ─────
const MotionLink = motion.create(Link);

export function MagneticLink({
  href,
  children,
  className,
  strength = 0.3,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  function handle(e: MouseEvent<HTMLAnchorElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      onMouseMove={handle}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={cn("inline-flex items-center", className)}
    >
      {children}
    </MotionLink>
  );
}
