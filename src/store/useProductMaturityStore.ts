import { create } from "zustand";
import type { ProductMaturityModeId, ProductMaturitySnapshot } from "@/types/product-maturity";

export type ProductMaturityTab =
  | "design"
  | "ergo"
  | "exec"
  | "calm"
  | "immerse"
  | "micro"
  | "brand"
  | "a11y"
  | "prefs"
  | "modes";

interface ProductMaturityState {
  snapshot: ProductMaturitySnapshot | null;
  activeTab: ProductMaturityTab;
  setSnapshot: (snapshot: ProductMaturitySnapshot) => void;
  setActiveTab: (tab: ProductMaturityTab) => void;
  setActiveMode: (mode: ProductMaturityModeId) => void;
}

export const useProductMaturityStore = create<ProductMaturityState>((set) => ({
  snapshot: null,
  activeTab: "design",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
