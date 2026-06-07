"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useDevice } from "@/lib/device-store";
import { useCart, cartCount } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import type { Locale } from "@/lib/i18n/config";

// Native-app-style bottom tab bar. Visible only while App Mode is on. Sits
// above page content (which gets bottom padding from globals.css) and honours
// the iOS safe-area inset so it clears the home indicator.

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function ShopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16l-1 13H5L4 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9px] text-background">
      {count}
    </span>
  );
}

export function AppNavBar({ locale }: { locale: Locale }) {
  const appMode = useDevice((s) => s.appMode);
  const pathname = usePathname();
  const openCart = useCart((s) => s.open);
  const cart = useCart((s) => s.items);
  const wishlist = useWishlist((s) => s.items);

  const cartQty = cartCount(cart);
  const wishQty = wishlist.length;

  const isDe = locale === "de";
  const base = `/${locale}`;

  // Active-tab matching against the current path (locale-prefixed).
  const path = pathname ?? "";
  const isHome = path === base || path === `${base}/`;
  const isShop = path.startsWith(`${base}/shop`);
  const isWish = path.startsWith(`${base}/wishlist`);
  const isAccount =
    path.startsWith(`${base}/account`) || path.startsWith(`${base}/login`);

  const tabClass = (active: boolean) =>
    `relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
      active ? "text-foreground" : "text-muted hover:text-foreground"
    }`;
  const labelClass = "font-mono text-[8px] uppercase tracking-[0.15em]";

  return (
    <AnimatePresence>
      {appMode && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          aria-label={isDe ? "App-Navigation" : "App navigation"}
          className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md items-stretch border-t border-border bg-background/90 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <Link href={base} className={tabClass(isHome)} aria-current={isHome ? "page" : undefined}>
            <HomeIcon />
            <span className={labelClass}>{isDe ? "Start" : "Home"}</span>
          </Link>
          <Link href={`${base}/shop`} className={tabClass(isShop)} aria-current={isShop ? "page" : undefined}>
            <ShopIcon />
            <span className={labelClass}>Shop</span>
          </Link>
          <Link href={`${base}/wishlist`} className={tabClass(isWish)} aria-current={isWish ? "page" : undefined}>
            <span className="relative">
              <HeartIcon />
              <Badge count={wishQty} />
            </span>
            <span className={labelClass}>{isDe ? "Merken" : "Saved"}</span>
          </Link>
          <button type="button" onClick={openCart} className={tabClass(false)}>
            <span className="relative">
              <BagIcon />
              <Badge count={cartQty} />
            </span>
            <span className={labelClass}>{isDe ? "Tasche" : "Bag"}</span>
          </button>
          <Link href={`${base}/account`} className={tabClass(isAccount)} aria-current={isAccount ? "page" : undefined}>
            <UserIcon />
            <span className={labelClass}>{isDe ? "Konto" : "Account"}</span>
          </Link>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
