"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ScanSearch, UserRound, X, Zap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Startseite" },
  { href: "/leistungen", label: "Leistungen" },
  { href: "/analyse", label: "KI Analyse" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ueber-uns", label: "Über Uns" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // The menu is "open for" a specific path — navigating closes it implicitly.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) => {
    const value = typeof next === "function" ? next(open) : next;
    setOpenPath(value ? pathname : null);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-edge bg-page/85 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:h-[4.5rem] md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow shadow-md shadow-accent/25">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            NOREVAN<span className="text-accent"> Digital</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-accent" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <UserRound className="h-4 w-4" />
            Login
          </Link>
          <Link
            href="/analyse"
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <ScanSearch className="h-4 w-4" />
            Kostenlose Analyse
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-ink transition-colors hover:bg-card"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b border-edge bg-page/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-5 pt-2 pb-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-accent/10 text-accent"
                        : "text-ink-soft hover:bg-card hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="space-y-2.5 pt-3">
                <Link
                  href="/analyse"
                  className="btn-primary block rounded-full px-5 py-3 text-center text-base font-semibold"
                >
                  Kostenlose Analyse
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary block rounded-full px-5 py-3 text-center text-base font-semibold"
                >
                  Login / Konto
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
