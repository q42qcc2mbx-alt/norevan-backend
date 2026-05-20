"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

export function LangSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === current) return;
    const segments = pathname.split("/");
    if (segments.length > 1 && (locales as readonly string[]).includes(segments[1])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.replace(segments.join("/") || `/${next}`);
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-medium"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          className={cn(
            "rounded-full px-3 py-1 transition-colors",
            loc === current
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground",
          )}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
