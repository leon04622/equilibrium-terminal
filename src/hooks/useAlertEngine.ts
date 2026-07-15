"use client";

import { useEffect } from "react";
import { ingestBookForAlerts } from "@/lib/alerts/BookMetricsTracker";
import { ingestTradeForAlerts } from "@/lib/alerts/MetricsTracker";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useTerminalStore } from "@/store/terminalStore";

/** Subscribes to book + trade streams and feeds the non-blocking alert evaluator. */
export function useAlertEngine() {
  useEffect(() => {
    const unsubTrades = useTerminalStore.subscribe(
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

    const unsubBook = useTerminalStore.subscribe(
      (s) => s.bookVersion,
      () => {
        const { book, selectedCoin } = useTerminalStore.getState();
        if (!book || !selectedCoin) return;
        const events = ingestBookForAlerts(selectedCoin, book);
        for (const ev of events) {
          useAlertStore.getState().ingestMarketEvent(ev);
          useAgentOperationsStore.getState().ingestMarketEvent(ev);
        }
      },
    );

    return () => {
      unsubTrades();
      unsubBook();
    };
  }, []);
}
