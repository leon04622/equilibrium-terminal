"use client";

import { useEffect } from "react";
import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { useExecutionAnalyticsStore } from "@/store/useExecutionAnalyticsStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 1_500;

export function useExecutionAnalytics(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const coin = useTerminalStore.getState().selectedCoin;
      useExecutionAnalyticsStore
        .getState()
        .setSnapshot(ExecutionAnalyticsOrchestrator.snapshot(coin));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubMatrix = useExecutionIntelligenceStore.subscribe(
      (s) => s.matrixVersion,
      () => refresh(),
    );
    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, () => refresh());
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => refresh());

    return () => {
      window.clearInterval(id);
      unsubMatrix();
      unsubBook();
      unsubCoin();
    };
  }, [enabled]);
}
