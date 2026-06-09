import { create } from "zustand";
import type { BillingDeskModeId, BillingDeskSnapshot } from "@/types/billing-commercial";

export type BillingDeskTab =
  | "plans"
  | "entitlements"
  | "orgs"
  | "usage"
  | "invoices"
  | "payments"
  | "licenses"
  | "audit"
  | "analytics"
  | "reliability"
  | "modes";

interface BillingDeskState {
  snapshot: BillingDeskSnapshot | null;
  activeTab: BillingDeskTab;
  setSnapshot: (snapshot: BillingDeskSnapshot) => void;
  setActiveTab: (tab: BillingDeskTab) => void;
  setActiveMode: (mode: BillingDeskModeId) => void;
}

export const useBillingDeskStore = create<BillingDeskState>((set) => ({
  snapshot: null,
  activeTab: "plans",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
