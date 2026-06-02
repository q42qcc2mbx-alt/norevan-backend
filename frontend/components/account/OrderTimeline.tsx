import { cn } from "@/lib/cn";

// Order lifecycle as a small progress timeline. Maps the backend status to one
// of three steps; "cancelled" shows a distinct terminal state.
const STEPS = ["ordered", "paid", "shipped"] as const;

const LABELS: Record<"de" | "en", [string, string, string]> = {
  de: ["Bestellt", "Bezahlt", "Versandt"],
  en: ["Ordered", "Paid", "Shipped"],
};

function stepIndex(status: string): number {
  switch (status) {
    case "shipped":
    case "delivered":
      return 2;
    case "paid":
      return 1;
    default:
      return 0; // pending / demo / unknown
  }
}

export function OrderTimeline({
  status,
  locale,
}: {
  status: string;
  locale: "de" | "en";
}) {
  if (status === "cancelled") {
    return (
      <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {locale === "de" ? "Storniert" : "Cancelled"}
      </div>
    );
  }

  const current = stepIndex(status);
  const labels = LABELS[locale];

  return (
    <div className="mt-4 flex items-center">
      {STEPS.map((_, i) => {
        const done = i <= current;
        return (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full border text-[8px] transition-colors",
                  done
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-transparent",
                )}
                aria-hidden
              >
                ✓
              </span>
              <span
                className={cn(
                  "font-mono text-[8px] uppercase tracking-[0.15em]",
                  done ? "text-foreground" : "text-muted",
                )}
              >
                {labels[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-px flex-1 -translate-y-2",
                  i < current ? "bg-foreground" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
