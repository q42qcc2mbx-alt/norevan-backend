"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Zap } from "lucide-react";

const links = [
  { href: "#warum-wir", label: "Vorteile" },
  { href: "#leistungen", label: "Leistungen" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-edge bg-white/85 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[4.5rem] md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow shadow-md shadow-accent/25">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            NOREVAN<span className="text-accent"> Digital</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#kontakt"
            className="btn-secondary inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Projekt starten
          </a>
          <a
            href="#analyse"
            className="btn-primary inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Kostenlose Analyse
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-ink transition-colors hover:bg-card lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b border-edge bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-5 pt-2 pb-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-card hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
              <div className="space-y-2.5 pt-3">
                <a
                  href="#analyse"
                  onClick={() => setOpen(false)}
                  className="btn-primary block rounded-full px-5 py-3 text-center text-base font-semibold"
                >
                  Kostenlose Analyse
                </a>
                <a
                  href="#kontakt"
                  onClick={() => setOpen(false)}
                  className="btn-secondary block rounded-full px-5 py-3 text-center text-base font-semibold"
                >
                  Projekt starten
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
