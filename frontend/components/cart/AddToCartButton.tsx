"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart-store";
import { cn } from "@/lib/cn";

export function AddToCartButton({
  item,
  needsSize,
  size,
  label,
  sizeRequiredLabel,
  className,
  onMissingSize,
  soldOut,
  soldOutLabel = "Ausverkauft",
}: {
  item: Omit<CartItem, "qty" | "size">;
  needsSize?: boolean;
  size?: string;
  label: string;
  sizeRequiredLabel: string;
  className?: string;
  onMissingSize?: () => void;
  soldOut?: boolean;
  soldOutLabel?: string;
}) {
  const add = useCart((s) => s.add);
  const [tooltip, setTooltip] = useState<string | null>(null);

  function handleClick() {
    if (needsSize && !size) {
      setTooltip(sizeRequiredLabel);
      onMissingSize?.();
      setTimeout(() => setTooltip(null), 2200);
      return;
    }
    add({ ...item, size });
  }

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        className={cn(
          "inline-flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-border bg-muted-bg px-6 text-sm font-medium text-muted",
          className,
        )}
      >
        {soldOutLabel}
      </button>
    );
  }

  return (
    <div className="relative inline-flex">
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -1 }}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90",
          className,
        )}
      >
        {label}
      </motion.button>
      {tooltip && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-lg"
        >
          {tooltip}
        </motion.span>
      )}
    </div>
  );
}
