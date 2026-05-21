"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  brand: string;
};

type WishlistState = {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (slug: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (slug: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: s.items.some((x) => x.slug === item.slug)
            ? s.items
            : [...s.items, item],
        })),
      remove: (slug) =>
        set((s) => ({ items: s.items.filter((x) => x.slug !== slug) })),
      toggle: (item) => {
        if (get().has(item.slug)) get().remove(item.slug);
        else get().add(item);
      },
      has: (slug) => get().items.some((x) => x.slug === slug),
      clear: () => set({ items: [] }),
    }),
    { name: "shop-wishlist-v1", partialize: (s) => ({ items: s.items }) },
  ),
);

export const wishlistCount = (items: WishlistItem[]) => items.length;
