"use client";

import { useEffect } from "react";
import { MarketScreenerEngine } from "@/lib/institutional/MarketScreenerEngine";
import { useMarketScreenerStore } from "@/store/useMarketScreenerStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useExternalNewsStore } from "@/store/useExternalNewsStore";

const TICK_MS = 3_000;

export function useMarketScreener(enabled = true): void {
  const filter = useMarketScreenerStore((s) => s.filter);

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const snapshot = MarketScreenerEngine.snapshot(
        useMarketScreenerStore.getState().filter,
      );
      useMarketScreenerStore.getState().setSnapshot(snapshot);
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubMids = useTerminalStore.subscribe((s) => s.mids, () => refresh());
    const unsubAssets = useTerminalStore.subscribe((s) => s.assetsLoaded, () => refresh());
    const unsubNews = useExternalNewsStore.subscribe(() => refresh());

    return () => {
      window.clearInterval(id);
      unsubMids();
      unsubAssets();
      unsubNews();
    };
  }, [enabled, filter]);
}
