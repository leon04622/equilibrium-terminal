"use client";

import { useEffect } from "react";
import { ChartAnalyticsOrchestrator } from "@/lib/charting/ChartAnalyticsOrchestrator";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_000;

export function useChartAnalytics(enabled = true): void {
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const overlays = useChartAnalyticsStore((s) => s.overlays);

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
      const coin = useTerminalStore.getState().selectedCoin;
      const snap = ChartAnalyticsOrchestrator.snapshot(coin, timeframe, overlays);
      const visible = chartReplayEngine.visibleCandles();
      useChartAnalyticsStore.getState().setSnapshot(snap);
      useChartAnalyticsStore.getState().setDisplayCandles(visible);
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubCandle = useTerminalStore.subscribe((s) => s.candleVersion, refresh);
    const unsubTrade = useTerminalStore.subscribe((s) => s.trades.length, refresh);
    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, refresh);
    const unsubIntel = useTerminalStore.subscribe(
      (s) => s.intelligenceVersion,
      refresh,
    );
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => {
      chartReplayEngine.goLive();
      refresh();
    });
    const unsubExec = useExecutionIntelligenceStore.subscribe(
      (s) => s.matrixVersion,
      () => refresh(),
    );

    return () => {
      window.clearInterval(id);
      unsubCandle();
      unsubTrade();
      unsubBook();
      unsubIntel();
      unsubCoin();
      unsubExec();
      chartReplayEngine.setHandler(null);
    };
  }, [enabled, timeframe, overlays]);
}
