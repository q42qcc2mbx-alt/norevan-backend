import { cn } from "@/lib/cn";

function Star({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.9l-5.8 3.05 1.1-6.45-4.7-4.6 6.5-.95L12 2.5z" />
    </svg>
  );
}

/** Read-only star rating (rounds to nearest whole star for display). */
export function Stars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[var(--gold)]", className)} aria-label={`${value} von 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} filled={i < rounded} size={size} />
      ))}
    </span>
  );
}
