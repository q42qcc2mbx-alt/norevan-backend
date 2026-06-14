"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, ScanSearch, UserRound } from "lucide-react";
import { useDevice, isAppModeDevice } from "@/lib/device-store";

// Bottom tab navigation for app mode (phone/tablet). Agency-adapted tabs
// (Start · Analyse · Kontakt · Konto) instead of a shop's Shop/Cart. Respects
// the iPhone safe-area; only rendered when the device is in app mode.

const TABS = [
  { href: "/", label: "Start", icon: Home },
  { href: "/analyse", label: "Analyse", icon: ScanSearch },
  { href: "/kontakt", label: "Kontakt", icon: Mail },
  { href: "/dashboard", label: "Konto", icon: UserRound },
];

export default function AppNavBar() {
  const { device } = useDevice();
  const pathname = usePathname();

  if (!isAppModeDevice(device)) return null;

  return (
    <nav
      aria-label="App-Navigation"
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-edge bg-page/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-accent" : "text-ink-muted"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-accent" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
