"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function ProductGallery({
  images,
  tapHint,
  className,
}: {
  images: { src: string; alt: string }[];
  tapHint?: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active];
  const canCycle = images.length > 1;

  function next() {
    if (!canCycle) return;
    setActive((i) => (i + 1) % images.length);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <button
        type="button"
        onClick={next}
        aria-label={tapHint}
        className={cn(
          "group relative aspect-[4/5] overflow-hidden rounded-2xl border border-foreground bg-muted-bg text-left",
          canCycle ? "cursor-pointer" : "cursor-default",
        )}
        disabled={!canCycle}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={main.src}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={main.src}
              alt={main.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {canCycle && (
          <>
            {/* Top-left: counter */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1 bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground backdrop-blur">
              <span>{String(active + 1).padStart(2, "0")}</span>
              <span className="text-muted">/</span>
              <span className="text-muted">
                {String(images.length).padStart(2, "0")}
              </span>
            </div>

            {/* Bottom-right: tap hint */}
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 bg-foreground px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-background"
            >
              <SwapIcon />
              {tapHint ?? "TAP TO SWAP"}
            </motion.div>

            {/* Subtle hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/5" />
          </>
        )}
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                i === active
                  ? "border-foreground"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SwapIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 3l4 4-4 4" />
      <path d="M4 7h16" />
      <path d="M8 21l-4-4 4-4" />
      <path d="M20 17H4" />
    </svg>
  );
}
