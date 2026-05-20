"use client";

import dynamic from "next/dynamic";

/**
 * SSR-safe lazy wrapper for ProductSlider3D.
 * Three.js / R3F require browser globals — `ssr: false` is mandatory.
 */
export const ProductSlider3DLazy = dynamic(
  () =>
    import("./ProductSlider3D").then((m) => ({ default: m.ProductSlider3D })),
  { ssr: false },
);
