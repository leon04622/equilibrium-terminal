import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { NotificationDeliveryEngine } from "@/lib/distribution/NotificationDeliveryEngine";
import type {
  DistributionChannelPrefs,
  InformationDistributionSnapshot,
} from "@/types/information-distribution";

export type DistributionTab = "tape" | "incidents" | "briefings" | "personal" | "delivery" | "syndication";

function snapshotFingerprint(snapshot: InformationDistributionSnapshot): string {
  const top = snapshot.newswire[0]?.id ?? "";
  const inc = snapshot.incidents[0]?.id ?? "";
  return `${snapshot.newswire.length}:${top}:${snapshot.incidents.length}:${inc}:${snapshot.distributionScore}`;
}

export interface InformationDistributionState {
  snapshot: InformationDistributionSnapshot | null;
  activeTab: DistributionTab;
  wireVersion: number;
  channelPrefs: DistributionChannelPrefs;
  pipelineActive: boolean;

  setSnapshot: (snapshot: InformationDistributionSnapshot) => void;
  setActiveTab: (tab: DistributionTab) => void;
  bumpWireVersion: () => void;
  setChannelPrefs: (prefs: Partial<DistributionChannelPrefs>) => void;
  hydratePrefs: () => void;
}

export const useInformationDistributionStore = create<InformationDistributionState>()(
  subscribeWithSelector((set, get) => ({
    snapshot: null,
    activeTab: "tape",
    wireVersion: 0,
    channelPrefs: NotificationDeliveryEngine.loadPrefs(),
    pipelineActive: false,

    setSnapshot: (snapshot) =>
      set((s) => {
        const fp = snapshotFingerprint(snapshot);
        const prevFp = s.snapshot ? snapshotFingerprint(s.snapshot) : "";
        if (fp === prevFp) return s;
        return {
          snapshot,
          pipelineActive: true,
          wireVersion: s.wireVersion + 1,
        };
      }),
    setActiveTab: (activeTab) => set({ activeTab }),
    bumpWireVersion: () => set((s) => ({ wireVersion: s.wireVersion + 1 })),
    setChannelPrefs: (patch) => {
      const next = { ...get().channelPrefs, ...patch };
      NotificationDeliveryEngine.savePrefs(next);
      set({ channelPrefs: next });
    },
    hydratePrefs: () => set({ channelPrefs: NotificationDeliveryEngine.loadPrefs() }),
  })),
);
