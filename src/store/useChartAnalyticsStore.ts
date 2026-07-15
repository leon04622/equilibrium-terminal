import { create } from "zustand";

import { subscribeWithSelector } from "zustand/middleware";

import {

  loadChartTimeframe,

  saveChartTimeframe,

} from "@/lib/charting/chartPrefs";

import { ChartSyncCoordinator } from "@/lib/charting/ChartSyncCoordinator";

import { chartReplayEngine } from "@/lib/charting/ReplayEngine";

import type {

  ChartAnalyticsSnapshot,

  ChartOverlayLayer,

  ChartTimeframe,

} from "@/types/chart-analytics";

import type { NormalizedCandle } from "@/types/terminal-schema";



const initialTimeframe = loadChartTimeframe();

ChartSyncCoordinator.initTimeframe(initialTimeframe);



export interface ChartAnalyticsState {

  snapshot: ChartAnalyticsSnapshot | null;

  displayCandles: NormalizedCandle[];

  historyVersion: number;

  historyLoading: boolean;

  timeframe: ChartTimeframe;

  overlays: ChartOverlayLayer[];



  setSnapshot: (snapshot: ChartAnalyticsSnapshot) => void;

  setDisplayCandles: (candles: NormalizedCandle[]) => void;

  setHistoryCandles: (candles: NormalizedCandle[]) => void;

  setHistoryLoading: (loading: boolean) => void;

  setTimeframe: (tf: ChartTimeframe) => void;

  toggleOverlay: (layer: ChartOverlayLayer) => void;

  setLinked: (linked: boolean) => void;

  replayPlay: () => void;

  replayPause: () => void;

  replayLive: () => void;

  replayScrub: (time: number) => void;

}



const DEFAULT_OVERLAYS: ChartOverlayLayer[] = [

  "event_markers",

  "volume_profile",

  "liquidity_heatmap",

  "liquidation_zones",

];



export const useChartAnalyticsStore = create<ChartAnalyticsState>()(

  subscribeWithSelector((set, get) => ({

    snapshot: null,

    displayCandles: [],

    historyVersion: 0,

    historyLoading: false,

    timeframe: initialTimeframe,

    overlays: DEFAULT_OVERLAYS,



    setSnapshot: (snapshot) => set({ snapshot }),

    setDisplayCandles: (displayCandles) => set({ displayCandles }),

    setHistoryCandles: (displayCandles) =>

      set((s) => ({

        displayCandles,

        historyVersion: s.historyVersion + 1,

        historyLoading: false,

      })),

    setHistoryLoading: (historyLoading) => set({ historyLoading }),



    setTimeframe: (timeframe) => {
      ChartSyncCoordinator.setTimeframe(timeframe);
      saveChartTimeframe(timeframe);
      set({ timeframe });
    },



    toggleOverlay: (layer) => {

      const cur = get().overlays;

      const next = cur.includes(layer)

        ? cur.filter((l) => l !== layer)

        : [...cur, layer];

      set({ overlays: next });

    },



    setLinked: (linked) => ChartSyncCoordinator.setLinked(linked),



    replayPlay: () => {

      chartReplayEngine.play();

      const replay = chartReplayEngine.getState();

      set((s) =>

        s.snapshot

          ? {

              snapshot: { ...s.snapshot, replay },

              displayCandles: chartReplayEngine.visibleCandles(),

            }

          : {},

      );

    },



    replayPause: () => {

      chartReplayEngine.pause();

      const replay = chartReplayEngine.getState();

      set((s) =>

        s.snapshot ? { snapshot: { ...s.snapshot, replay } } : {},

      );

    },



    replayLive: () => {

      chartReplayEngine.goLive();

      const replay = chartReplayEngine.getState();

      set((s) =>

        s.snapshot

          ? {

              snapshot: { ...s.snapshot, replay },

              displayCandles: chartReplayEngine.visibleCandles(),

            }

          : {},

      );

    },



    replayScrub: (time) => {

      chartReplayEngine.scrubToTime(time);

      set({

        displayCandles: chartReplayEngine.visibleCandles(),

        snapshot: get().snapshot

          ? { ...get().snapshot!, replay: chartReplayEngine.getState() }

          : null,

      });

    },

  })),

);


