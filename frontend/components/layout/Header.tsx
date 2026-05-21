"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/cart/CartIcon";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitcher } from "./LangSwitcher";
import { SearchOverlay } from "./SearchOverlay";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/cn";

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
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          <Link href={`/${locale}`} aria-label="Norevan">
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

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href={`/${locale}/shop`}
              className="mono transition-colors hover:text-muted"
            >
              {dict.nav.shop}
            </Link>
            <Link
              href={`/${locale}/lookbook`}
              className="mono transition-colors hover:text-muted"
            >
              Lookbook
            </Link>
            <Link
              href={`/${locale}#categories`}
              className="mono transition-colors hover:text-muted"
            >
              {dict.nav.categories}
            </Link>
          </nav>

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
            <button
              type="button"
              aria-label={locale === "de" ? "Wunschliste" : "Wishlist"}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground sm:inline-flex"
            >
              <HeartIcon />
            </button>
            <Link
              href={`/${locale}/login`}
              aria-label={dict.login.cta}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground sm:inline-flex"
            >
              <UserIcon />
            </Link>
            <ThemeToggle label={dict.theme.toggle} />
            <CartIcon ariaLabel={dict.nav.cart} />
          </div>
        </div>
      </motion.header>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
        products={products}
      />
    </>
  );
}
