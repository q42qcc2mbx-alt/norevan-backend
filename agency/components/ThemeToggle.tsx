"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // true after hydration on the client, false during SSR — avoids a mismatch.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Render a stable placeholder until mounted to avoid hydration mismatch.
  if (!mounted) {
    return <span className="inline-block h-9 w-9 rounded-full border border-edge" aria-hidden />;
  }

  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={dark ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-surface text-ink-soft transition-all hover:border-accent/40 hover:text-ink"
    >
      {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}
