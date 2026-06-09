"use client";

import { useEffect } from "react";
import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import { useMarketMemoryStore } from "@/store/useMarketMemoryStore";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_500;

export function useMarketMemory(enabled = true): void {
  const searchQuery = useMarketMemoryStore((s) => s.searchQuery);

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      const q = useMarketMemoryStore.getState().searchQuery;
      useMarketMemoryStore
        .getState()
        .setSnapshot(MarketMemoryOrchestrator.snapshot(asset, q));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubCandle = useTerminalStore.subscribe((s) => s.candleVersion, refresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, refresh);
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, refresh);
    const unsubReplay = useChartAnalyticsStore.subscribe(
      (s) => s.snapshot?.replay.mode,
      refresh,
    );

    return () => {
      window.clearInterval(id);
      unsubCandle();
      unsubIntel();
      unsubCoin();
      unsubReplay();
    };
  }, [enabled, searchQuery]);
}
