"use client";

import { useEffect } from "react";
import { MarketCoverageOrchestrator } from "@/lib/coverage";
import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;

export function useMarketCoverage(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useMarketCoverageStore.getState().setSnapshot(MarketCoverageOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, refresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, refresh);
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, refresh);

    return () => {
      window.clearInterval(id);
      unsubBook();
      unsubIntel();
      unsubConn();
    };
  }, [enabled]);
}
