"use client";

import { useEffect } from "react";
import { MarketCommandOrchestrator } from "@/lib/market-command/MarketCommandOrchestrator";
import { useMarketCommandStore } from "@/store/useMarketCommandStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useSystemicIntelligenceStore } from "@/store/useSystemicIntelligenceStore";
import { useGlobalIntelStore } from "@/store/useGlobalIntelStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;

export function useMarketCommand(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useMarketCommandStore.getState().setSnapshot(MarketCommandOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubAtmo = useMarketAtmosphereStore.subscribe(refresh);
    const unsubSys = useSystemicIntelligenceStore.subscribe(refresh);
    const unsubGlobal = useGlobalIntelStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubAtmo();
      unsubSys();
      unsubGlobal();
    };
  }, [enabled]);
}
