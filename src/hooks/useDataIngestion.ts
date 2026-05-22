"use client";

import { useEffect } from "react";
import { HyperliquidIngestBridge, IngestOrchestrator } from "@/lib/ingest";
import { ingestBus } from "@/lib/ingest/UnifiedIngestBus";
import { useDataIngestionStore } from "@/store/useDataIngestionStore";

const TICK_MS = 2_000;

export function useDataIngestion(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const stopBridge = HyperliquidIngestBridge.start();

    const refresh = () => {
      useDataIngestionStore.getState().setSnapshot(IngestOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const syncId = window.setInterval(() => {
      const snap = useDataIngestionStore.getState().snapshot;
      if (!snap?.recentEvents.length) return;
      void fetch("/api/ingestion/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: snap.recentEvents.slice(0, 32), vitals: snap.processing }),
      }).catch(() => undefined);
    }, 20_000);

    const offStale = ingestBus.on("feed:stale", ({ sourceId, staleMs }) => {
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
      stopBridge();
    };
  }, [enabled]);
}
