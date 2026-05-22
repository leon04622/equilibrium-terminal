import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  IntelligenceIndexEntry,
  MarketSurveillanceSnapshot,
  TimelineEvent,
} from "@/types/information-discovery";

export interface SurveillanceWatchEntry {
  coin: string;
  addedAt: number;
  label?: string;
}

export interface InformationDiscoveryState {
  index: IntelligenceIndexEntry[];
  indexVersion: number;
  surveillance: MarketSurveillanceSnapshot | null;
  assetTimeline: TimelineEvent[];
  watchlist: SurveillanceWatchEntry[];
  pipelineActive: boolean;

  setIndex: (index: IntelligenceIndexEntry[]) => void;
  setSurveillance: (snapshot: MarketSurveillanceSnapshot) => void;
  setAssetTimeline: (events: TimelineEvent[]) => void;
  addToWatchlist: (coin: string) => void;
  removeFromWatchlist: (coin: string) => void;
  setPipelineActive: (active: boolean) => void;
}

export const useInformationDiscoveryStore = create<InformationDiscoveryState>()(
  subscribeWithSelector((set, get) => ({
    index: [],
    indexVersion: 0,
    surveillance: null,
    assetTimeline: [],
    watchlist: [{ coin: "BTC", addedAt: Date.now() }, { coin: "ETH", addedAt: Date.now() }],
    pipelineActive: false,

    setIndex: (index) => set((s) => ({ index, indexVersion: s.indexVersion + 1 })),
    setSurveillance: (surveillance) => set({ surveillance }),
    setAssetTimeline: (assetTimeline) => set({ assetTimeline }),
    addToWatchlist: (coin) => {
      const upper = coin.toUpperCase();
      if (get().watchlist.some((w) => w.coin === upper)) return;
      set((s) => ({
        watchlist: [...s.watchlist, { coin: upper, addedAt: Date.now() }].slice(0, 48),
      }));
    },
    removeFromWatchlist: (coin) =>
      set((s) => ({
        watchlist: s.watchlist.filter((w) => w.coin !== coin.toUpperCase()),
      })),
    setPipelineActive: (pipelineActive) => set({ pipelineActive }),
  })),
);
