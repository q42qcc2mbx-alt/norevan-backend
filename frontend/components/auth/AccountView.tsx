"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/i18n/config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-border-subtle px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
      <div className="mt-1 text-lg font-medium tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

export function AccountView({ locale }: { locale: Locale }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();
  const isDe = locale === "de";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-sm bg-muted-bg" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <p className="text-base text-muted">
          {isDe
            ? "Melde dich an, um dein Konto zu verwalten."
            : "Sign in to manage your account."}
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-8 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-80"
        >
          {isDe ? "Anmelden" : "Sign in"}
          <span aria-hidden>→</span>
        </Link>
        <div className="mt-10 border-t border-border-subtle pt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatBox
              label={isDe ? "Wunschliste" : "Wishlist"}
              value={wishlistItems.length}
            />
            <StatBox
              label={isDe ? "Im Warenkorb" : "In cart"}
              value={cartItems.reduce((s, i) => s + i.qty, 0)}
            />
          </div>
        </div>
      </div>
    );
  }

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString(
        isDe ? "de-DE" : "en-GB",
        { day: "2-digit", month: "long", year: "numeric" },
      )
    : "–";

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <div className="border border-border-subtle p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              {isDe ? "Angemeldet als" : "Signed in as"}
            </div>
            <div className="mt-1 text-base font-medium text-foreground">
              {user.email}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {isDe ? "Abmelden" : "Sign out"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatBox
          label={isDe ? "Mitglied seit" : "Member since"}
          value={joined}
        />
        <StatBox
          label={isDe ? "Wunschliste" : "Wishlist"}
          value={wishlistItems.length}
        />
        <StatBox
          label={isDe ? "Im Warenkorb" : "In cart"}
          value={cartItems.reduce((s, i) => s + i.qty, 0)}
        />
      </div>

      {/* Quick links */}
      <div className="border-t border-border-subtle pt-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {isDe ? "Schnellzugriff" : "Quick access"}
        </span>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              label: isDe ? "Wunschliste anzeigen" : "View wishlist",
              href: `/${locale}/wishlist`,
              count: wishlistItems.length,
            },
            {
              label: isDe ? "Warenkorb anzeigen" : "View cart",
              href: `/${locale}/cart`,
              count: cartItems.reduce((s, i) => s + i.qty, 0),
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between border border-border-subtle px-5 py-4 transition-colors hover:border-foreground"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                {link.label}
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] text-muted group-hover:text-foreground">
                {link.count > 0 && (
                  <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[9px] text-background">
                    {link.count}
                  </span>
                )}
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
