"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  qty: number;
  size?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  bumpKey: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (slug: string, size?: string) => void;
  setQty: (slug: string, qty: number, size?: string) => void;
  clear: () => void;
};

const sameLine = (a: { slug: string; size?: string }, b: { slug: string; size?: string }) =>
  a.slug === b.slug && (a.size ?? "") === (b.size ?? "");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      bumpKey: 0,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (item) =>
        set((s) => {
          const qty = item.qty ?? 1;
          const idx = s.items.findIndex((x) => sameLine(x, item));
          const items =
            idx >= 0
              ? s.items.map((x, i) =>
                  i === idx ? { ...x, qty: x.qty + qty } : x,
                )
              : [...s.items, { ...item, qty }];
          return { items, isOpen: true, bumpKey: s.bumpKey + 1 };
        }),
      remove: (slug, size) =>
        set((s) => ({
          items: s.items.filter((x) => !sameLine(x, { slug, size })),
        })),
      setQty: (slug, qty, size) =>
        set((s) => ({
          items: s.items
            .map((x) => (sameLine(x, { slug, size }) ? { ...x, qty } : x))
            .filter((x) => x.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "shop-cart-v1",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.qty, 0);

export const cartSubtotalCents = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
