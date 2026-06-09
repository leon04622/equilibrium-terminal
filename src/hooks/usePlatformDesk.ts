"use client";

import { useEffect } from "react";
import { PlatformDeskOrchestrator } from "@/lib/platform-desk/PlatformDeskOrchestrator";
import { usePlatformDeskStore } from "@/store/usePlatformDeskStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_500;

export function usePlatformDesk(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      usePlatformDeskStore
        .getState()
        .setSnapshot(PlatformDeskOrchestrator.snapshot(asset));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, refresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, refresh);

    return () => {
      window.clearInterval(id);
      unsubCoin();
      unsubIntel();
    };
  }, [enabled]);
}
