"use client";

import dynamic from "next/dynamic";

/**
 * SSR-safe lazy wrapper for ExplodingInfo.
 * The underlying component creates a <Canvas> which requires browser APIs —
 * `ssr: false` ensures it is never rendered on the server.
 */
export const ExplodingInfoLazy = dynamic(
  () => import("./ExplodingInfo").then((m) => ({ default: m.ExplodingInfo })),
  { ssr: false },
);
