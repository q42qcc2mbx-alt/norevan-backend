"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/cart/CartIcon";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitcher } from "./LangSwitcher";
import { SearchOverlay } from "./SearchOverlay";
import { AppModeToggle } from "@/components/device/AppModeToggle";
import { AppModeButton } from "@/components/device/AppModeButton";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/cn";
import { useWishlist } from "@/lib/wishlist-store";
import { getSupabaseClient } from "@/lib/supabase/client";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <motion.line
        x1="3" y1="6" x2="21" y2="6"
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.line
        x1="3" y1="12" x2="21" y2="12"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="3" y1="18" x2="21" y2="18"
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ originX: "50%", originY: "50%" }}
      />
    </svg>
  );
}

export function Header({
  locale,
  dict,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  products: Product[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  // Reflect auth state in the account icon (subtle gold dot when signed in).
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session?.user),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/lookbook`, label: "Lookbook" },
    { href: `/${locale}#categories`, label: dict.nav.categories },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn(
          "sticky top-0 z-30 transition-colors duration-300",
          scrolled
            ? "border-b border-border-subtle bg-background/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          {/* Logo */}
          <Link href={`/${locale}`} aria-label="Norevan" onClick={() => setMobileOpen(false)}>
            <Image
              src="/logo/norevan-shield.png"
              alt="Norevan"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mono transition-colors hover:text-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <LangSwitcher current={locale} label={dict.lang.label} />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={locale === "de" ? "Suchen" : "Search"}
              title="⌘K"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground sm:inline-flex"
            >
              <SearchIcon />
            </button>
            <Link
              href={`/${locale}/wishlist`}
              aria-label={locale === "de" ? "Wunschliste" : "Wishlist"}
              className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground sm:inline-flex"
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground font-mono text-[9px] text-background">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href={`/${locale}/account`}
              aria-label={locale === "de" ? "Konto" : "Account"}
              className={cn(
                "relative hidden h-9 w-9 items-center justify-center rounded-full border transition-colors sm:inline-flex",
                signedIn ? "border-foreground" : "border-border hover:border-foreground",
              )}
            >
              <UserIcon />
              {signedIn && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                  style={{ background: "var(--gold)" }}
                />
              )}
            </Link>
            <ThemeToggle label={dict.theme.toggle} />
            <span className="inline-flex md:hidden">
              <AppModeButton />
            </span>
            <CartIcon ariaLabel={dict.nav.cart} />

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground md:hidden"
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-background shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
                <Link href={`/${locale}`} onClick={() => setMobileOpen(false)}>
                  <Image
                    src="/logo/norevan-shield.png"
                    alt="Norevan"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    unoptimized
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Schließen"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/60 hover:border-foreground hover:text-foreground transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 py-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="mono flex items-center px-3 py-3 text-lg tracking-widest text-foreground/70 transition-colors hover:text-foreground uppercase"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Divider */}
              <div className="mx-6 border-t border-border-subtle" />

              {/* Secondary actions */}
              <div className="flex flex-col gap-1 px-4 py-4">
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="mono flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/50 transition-colors hover:text-foreground uppercase tracking-widest"
                >
                  <SearchIcon />
                  {locale === "de" ? "Suchen" : "Search"}
                </button>
                <Link
                  href={`/${locale}/wishlist`}
                  onClick={() => setMobileOpen(false)}
                  className="mono flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/50 transition-colors hover:text-foreground uppercase tracking-widest"
                >
                  <HeartIcon />
                  {locale === "de" ? "Wunschliste" : "Wishlist"}
                  {wishlistCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-foreground font-mono text-[9px] text-background">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/${locale}/account`}
                  onClick={() => setMobileOpen(false)}
                  className="mono flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/50 transition-colors hover:text-foreground uppercase tracking-widest"
                >
                  <UserIcon />
                  {locale === "de" ? "Konto" : "Account"}
                  {signedIn && (
                    <span
                      className="ml-auto h-2 w-2 rounded-full"
                      style={{ background: "var(--gold)" }}
                    />
                  )}
                </Link>
                <AppModeToggle locale={locale} />
              </div>

              {/* Bottom bar */}
              <div className="mt-auto flex items-center justify-between border-t border-border-subtle px-6 py-5">
                <LangSwitcher current={locale} label={dict.lang.label} />
                <ThemeToggle label={dict.theme.toggle} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
        products={products}
      />
    </>
  );
}
