import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { IndustryIntegrationsSnapshot } from "@/types/industry-integrations";

export type IntegrationsTab =
  | "venues"
  | "partners"
  | "routing"
  | "api"
  | "embed"
  | "reports"
  | "deploy"
  | "public"
  | "scale";

export interface IndustryIntegrationsState {
  snapshot: IndustryIntegrationsSnapshot | null;
  activeTab: IntegrationsTab;
  integrationsVersion: number;

  setSnapshot: (snapshot: IndustryIntegrationsSnapshot) => void;
  setActiveTab: (tab: IntegrationsTab) => void;
}

export const useIndustryIntegrationsStore = create<IndustryIntegrationsState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "venues",
    integrationsVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        integrationsVersion: s.integrationsVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
