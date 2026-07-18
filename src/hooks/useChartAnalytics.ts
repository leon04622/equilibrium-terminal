"use client";

import { useEffect, useRef } from "react";
import { ChartAnalyticsOrchestrator } from "@/lib/charting/ChartAnalyticsOrchestrator";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

/** Slow fallback tick — live updates come from candleVersion / coin changes. */
const TICK_MS = 15_000;
const MIN_REFRESH_MS = 2_500;

export function useChartAnalytics(enabled = true): void {
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const overlays = useChartAnalyticsStore((s) => s.overlays);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    chartReplayEngine.setHandler((visible) => {
      useChartAnalyticsStore.getState().setDisplayCandles(visible);
      const snap = useChartAnalyticsStore.getState().snapshot;
      if (snap) {
        useChartAnalyticsStore.getState().setSnapshot({
          ...snap,
          replay: chartReplayEngine.getState(),
          barCount: visible.length,
        });
      }
    });

    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < MIN_REFRESH_MS) return;
      lastRefreshRef.current = now;

      const coin = useTerminalStore.getState().selectedCoin;
      const snap = ChartAnalyticsOrchestrator.snapshot(coin, timeframe, overlays);
      const visible = chartReplayEngine.visibleCandles();
      useChartAnalyticsStore.getState().setSnapshot(snap);
      if (visible.length > 0) {
        useChartAnalyticsStore.getState().setDisplayCandles(visible);
      }
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubCandle = useTerminalStore.subscribe((s) => s.candleVersion, refresh);
    const unsubIntel = useTerminalStore.subscribe(
      (s) => s.intelligenceVersion,
      refresh,
    );
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => {
      chartReplayEngine.goLive();
      lastRefreshRef.current = 0;
      refresh();
    });
    const unsubExec = useExecutionIntelligenceStore.subscribe(
      (s) => s.matrixVersion,
      () => refresh(),
    );

    return () => {
      window.clearInterval(id);
      unsubCandle();
      unsubIntel();
      unsubCoin();
      unsubExec();
      chartReplayEngine.setHandler(null);
    };
  }, [enabled, timeframe, overlays]);
}
