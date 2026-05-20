"use client";

import dynamic from "next/dynamic";

export const BrandLogos3DLazy = dynamic(
  () => import("./BrandLogos3D").then((m) => m.BrandLogos3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center">
        <div className="h-px w-16 overflow-hidden bg-border">
          <div className="h-full w-1/3 origin-left animate-pulse bg-foreground" />
        </div>
      </div>
    ),
  },
);
