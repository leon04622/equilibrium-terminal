import { create } from "zustand";
import type { CommercialProductSnapshot } from "@/types/commercial-product";

export type CommercialTab =
  | "packaging"
  | "onboarding"
  | "subscription"
  | "support"
  | "release"
  | "analytics"
  | "admin"
  | "alpha"
  | "position";

interface CommercialState {
  snapshot: CommercialProductSnapshot | null;
  activeTab: CommercialTab;
  walkthroughOpen: boolean;
  setSnapshot: (snapshot: CommercialProductSnapshot) => void;
  setActiveTab: (tab: CommercialTab) => void;
  setWalkthroughOpen: (open: boolean) => void;
}

export const useCommercialStore = create<CommercialState>((set) => ({
  snapshot: null,
  activeTab: "packaging",
  walkthroughOpen: false,
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setWalkthroughOpen: (walkthroughOpen) => set({ walkthroughOpen }),
}));
