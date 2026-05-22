import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { EnterpriseOperationsSnapshot } from "@/types/enterprise-operations";

export type EnterpriseOpsTab =
  | "org"
  | "desks"
  | "portfolio"
  | "alerts"
  | "audit"
  | "comms"
  | "knowledge"
  | "tenant"
  | "reliability";

export interface EnterpriseOpsState {
  snapshot: EnterpriseOperationsSnapshot | null;
  activeTab: EnterpriseOpsTab;
  opsVersion: number;

  setSnapshot: (snapshot: EnterpriseOperationsSnapshot) => void;
  setActiveTab: (tab: EnterpriseOpsTab) => void;
}

export const useEnterpriseOpsStore = create<EnterpriseOpsState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "org",
    opsVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        opsVersion: s.opsVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
