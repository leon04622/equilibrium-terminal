"use client";

import { useEffect } from "react";
import { ingestBus } from "@/lib/ingest/UnifiedIngestBus";
import { MarketDataBackboneOrchestrator } from "@/lib/ingest/MarketDataBackboneOrchestrator";
import { ExchangeIngestionOrchestrator } from "@/lib/ingest/workers/ExchangeIngestionOrchestrator";
import { useDataIngestionStore } from "@/store/useDataIngestionStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 6_000;
const SYNC_MS = 60_000;

export function useDataIngestion(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const stopWorkers = ExchangeIngestionOrchestrator.start(() => {
      const coin = useTerminalStore.getState().selectedAsset?.coin;
      return coin ?? "BTC";
    });

    const refresh = (force = false) => {
      if (!force && document.hidden) return;
      const coin = useTerminalStore.getState().selectedAsset?.coin ?? "BTC";
      useDataIngestionStore.getState().setSnapshot(
        MarketDataBackboneOrchestrator.platformSnapshot(coin),
      );
    };

    refresh(true);
    const id = window.setInterval(() => refresh(), TICK_MS);

    const syncId = window.setInterval(() => {
      const snap = useDataIngestionStore.getState().snapshot;
      if (!snap?.recentEvents.length) return;
      void fetch("/api/ingestion/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: snap.recentEvents.slice(0, 32), vitals: snap.processing }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const offStale = ingestBus.on("feed:stale", ({ sourceId, staleMs }) => {
      if (document.hidden) return;
      void fetch("/api/ingestion/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, staleMs, at: Date.now() }),
      }).catch(() => undefined);
    });

    return () => {
      window.clearInterval(id);
      window.clearInterval(syncId);
      offStale();
      stopWorkers();
    };
  }, [enabled]);
}
