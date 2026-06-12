/**
 * NOREVAN Digital — Logo / Markenzeichen.
 *
 * Drei Varianten zur Auswahl (Vorschläge aus dem Launch-Plan):
 *   • "monogram" — geometrisches „N" in einem Verlaufs-Badge (Standard,
 *                  klar, zeitlos, skaliert bis zum Favicon).
 *   • "pulse"    — Puls-/Performance-Linie, betont Geschwindigkeit & Monitoring.
 *   • "bolt"     — geschliffener Blitz, energetisch.
 *
 * Variante wechseln: zentral hier `DEFAULT_VARIANT` ändern — Navbar & Footer
 * übernehmen sie automatisch.
 */

export type LogoVariant = "monogram" | "pulse" | "bolt";

/** Aktuell verwendete Variante (eine Stelle ändern = überall geändert). */
export const DEFAULT_VARIANT: LogoVariant = "bolt";

function Mark({ variant, size }: { variant: LogoVariant; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan-glow shadow-sm"
      style={{ height: size, width: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="white"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {variant === "monogram" && <path d="M6 18 V6 L18 18 V6" />}
        {variant === "pulse" && <path d="M3 12 H7 L9.5 6.5 L13 17.5 L15 12 H21" />}
        {variant === "bolt" && (
          <path
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
            fill="white"
            stroke="none"
          />
        )}
      </svg>
    </span>
  );
}

export default function Logo({
  variant = DEFAULT_VARIANT,
  withWordmark = true,
  size = 32,
  wordmarkClass = "",
  className = "",
}: {
  variant?: LogoVariant;
  withWordmark?: boolean;
  size?: number;
  wordmarkClass?: string;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Mark variant={variant} size={size} />
      {withWordmark && (
        <span className={`font-display font-bold tracking-tight text-ink ${wordmarkClass}`}>
          NOREVAN<span className="text-accent"> Digital</span>
        </span>
      )}
    </span>
  );
}
