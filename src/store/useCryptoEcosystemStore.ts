import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { CryptoEcosystemSnapshot } from "@/types/crypto-ecosystem";

export type EcosystemTab =
  | "layers"
  | "portfolio"
  | "risk"
  | "execution"
  | "research"
  | "automation"
  | "compliance"
  | "developer"
  | "memory";

export interface CryptoEcosystemState {
  snapshot: CryptoEcosystemSnapshot | null;
  activeTab: EcosystemTab;
  ecosystemVersion: number;

  setSnapshot: (snapshot: CryptoEcosystemSnapshot) => void;
  setActiveTab: (tab: EcosystemTab) => void;
}

export const useCryptoEcosystemStore = create<CryptoEcosystemState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "layers",
    ecosystemVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        ecosystemVersion: s.ecosystemVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
