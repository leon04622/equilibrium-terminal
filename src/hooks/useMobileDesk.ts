"use client";

import { useEffect } from "react";
import { MobileDeskOrchestrator } from "@/lib/mobile-desk/MobileDeskOrchestrator";
import { useMobileDeskStore } from "@/store/useMobileDeskStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_500;

export function useMobileDesk(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      useMobileDeskStore.getState().setSnapshot(MobileDeskOrchestrator.snapshot(asset));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, refresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, refresh);
    const unsubAlerts = useAlertStore.subscribe((s) => s.triggersVersion, refresh);

    return () => {
      window.clearInterval(id);
      unsubCoin();
      unsubIntel();
      unsubAlerts();
    };
  }, [enabled]);
}
