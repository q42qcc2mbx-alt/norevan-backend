"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RvItem = {
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  brand: string;
};

type State = {
  items: RvItem[];
  record: (i: RvItem) => void;
};

export const useRecentlyViewed = create<State>()(
  persist(
    (set) => ({
      items: [],
      record: (i) =>
        set((s) => ({
          items: [i, ...s.items.filter((x) => x.slug !== i.slug)].slice(0, 8),
        })),
    }),
    { name: "recently-viewed-v1" },
  ),
);
