"use client";

import { Reveal } from "@/components/motion/Reveal";
import { BrandLogos3DLazy } from "@/components/three/BrandLogos3DLazy";
import type { Locale } from "@/lib/i18n/config";

export function BrandStrip({
  locale,
  title,
  subtitle,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="eyebrow">{title}</span>
            <h2
              className="headline-italic mt-4"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              {subtitle}
            </h2>
            <p className="body-soft mx-auto mt-4 max-w-md text-sm leading-[1.65]">
              {locale === "de"
                ? "Klick auf eine Marke um nur deren Stücke zu sehen."
                : "Click a brand to see only their pieces."}
            </p>
          </div>
        </Reveal>

        {/* 3D brand logos — floating in space, mouse-reactive, click to filter */}
        <BrandLogos3DLazy
          locale={locale}
          className="h-[280px] w-full md:h-[360px]"
        />
      </div>
    </section>
  );
}
