"use client";

import { useEffect } from "react";
import { ingestTradeForAlerts } from "@/lib/alerts/MetricsTracker";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useTerminalStore } from "@/store/terminalStore";

/** Subscribes to terminal trade stream and feeds the non-blocking alert evaluator. */
export function useAlertEngine() {
  useEffect(() => {
    return useTerminalStore.subscribe(
      (s) => s.trades[0]?.id,
      () => {
        const latest = useTerminalStore.getState().trades[0];
        if (!latest) return;
        const events = ingestTradeForAlerts(latest);
        for (const ev of events) {
          useAlertStore.getState().ingestMarketEvent(ev);
          useAgentOperationsStore.getState().ingestMarketEvent(ev);
        }
      },
    );
  }, []);
}
