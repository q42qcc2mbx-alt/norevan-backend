import Image from "next/image";
import { cn } from "@/lib/cn";

const BRANDS = {
  nike: { light: "/brands/nike.png", dark: "/brands/nike-dark.png" },
  "polo-ralph-lauren": {
    light: "/brands/polo-ralph-lauren.png",
    dark: "/brands/polo-ralph-lauren-dark.png",
  },
  "ami-paris": { light: "/brands/ami-paris.png", dark: "/brands/ami-paris.png" },
} as const;

export type BrandId = keyof typeof BRANDS;

export function BrandLogo({
  brand,
  className,
  width = 240,
  height = 120,
  alt,
}: {
  brand: BrandId;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}) {
  const { light, dark } = BRANDS[brand];
  const sameAsset = light === dark;
  const altText = alt ?? brand;

  if (sameAsset) {
    return (
      <Image
        src={light}
        alt={altText}
        width={width}
        height={height}
        className={cn("h-auto w-auto object-contain", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={light}
        alt={altText}
        width={width}
        height={height}
        className={cn("h-auto w-auto object-contain dark:hidden", className)}
      />
      <Image
        src={dark}
        alt={altText}
        width={width}
        height={height}
        className={cn(
          "hidden h-auto w-auto object-contain dark:block",
          className,
        )}
      />
    </>
  );
}

export const ALL_BRANDS: BrandId[] = ["nike", "polo-ralph-lauren", "ami-paris"];
