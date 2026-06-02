"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConsentStatus = "unset" | "accepted" | "declined";

type State = {
  status: ConsentStatus;
  accept: () => void;
  decline: () => void;
};

export const useConsent = create<State>()(
  persist(
    (set) => ({
      status: "unset",
      accept: () => set({ status: "accepted" }),
      decline: () => set({ status: "declined" }),
    }),
    { name: "nrv-consent-v1" },
  ),
);
