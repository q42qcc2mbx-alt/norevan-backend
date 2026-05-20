"use client";

import { motion } from "motion/react";
import { useCart, cartCount } from "@/lib/cart-store";

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CartIcon({ ariaLabel }: { ariaLabel: string }) {
  const open = useCart((s) => s.open);
  const items = useCart((s) => s.items);
  const bumpKey = useCart((s) => s.bumpKey);
  const count = cartCount(items);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={open}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted-bg"
    >
      <BagIcon />
      {count > 0 && (
        <motion.span
          key={bumpKey}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [1, 1.35, 1], opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground"
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}
