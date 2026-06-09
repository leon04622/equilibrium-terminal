"use client";

import { useEffect } from "react";
import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { useGlobalIntelStore } from "@/store/useGlobalIntelStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;

export function useGlobalIntel(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useGlobalIntelStore.getState().setSnapshot(GlobalIntelOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubAtmo = useMarketAtmosphereStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubAtmo();
    };
  }, [enabled]);
}
