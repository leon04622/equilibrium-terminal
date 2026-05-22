import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  AssetIntelligenceHub,
  CrossMarketInsight,
  MarketGraphQueryResult,
  MarketGraphSnapshot,
} from "@/types/market-knowledge-graph";

export interface MarketKnowledgeGraphState {
  snapshot: MarketGraphSnapshot;
  lastQuery: MarketGraphQueryResult | null;
  assetHub: AssetIntelligenceHub | null;
  crossMarket: CrossMarketInsight[];
  selectedEntityId: string | null;
  pipelineActive: boolean;
  version: number;

  setSnapshot: (snapshot: MarketGraphSnapshot) => void;
  setLastQuery: (result: MarketGraphQueryResult | null) => void;
  setAssetHub: (hub: AssetIntelligenceHub | null) => void;
  setCrossMarket: (insights: CrossMarketInsight[]) => void;
  setSelectedEntityId: (id: string | null) => void;
  setPipelineActive: (active: boolean) => void;
  bumpVersion: () => void;
}

export const useMarketKnowledgeGraphStore = create<MarketKnowledgeGraphState>()(
  subscribeWithSelector((set) => ({
    snapshot: { entityCount: 0, linkCount: 0, version: 0, updatedAt: 0 },
    lastQuery: null,
    assetHub: null,
    crossMarket: [],
    selectedEntityId: null,
    pipelineActive: false,
    version: 0,

    setSnapshot: (snapshot) => set({ snapshot }),
    setLastQuery: (lastQuery) => set({ lastQuery }),
    setAssetHub: (assetHub) => set({ assetHub }),
    setCrossMarket: (crossMarket) => set({ crossMarket }),
    setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }),
    setPipelineActive: (pipelineActive) => set({ pipelineActive }),
    bumpVersion: () => set((s) => ({ version: s.version + 1 })),
  })),
);
