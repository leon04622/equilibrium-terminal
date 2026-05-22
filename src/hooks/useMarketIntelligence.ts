"use client";

import { useEffect, useRef } from "react";
import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { ingestBus } from "@/lib/ingest/UnifiedIngestBus";
import { terminalBus } from "@/store/eventBus";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useMarketIntelligenceStore } from "@/store/useMarketIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_000;
const WIRE_DEDUPE_MS = 45_000;

export function useMarketIntelligence(enabled = true): void {
  const wiredRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const snapshot = IntelligenceOrchestrator.snapshot();
      useMarketIntelligenceStore.getState().setSnapshot(snapshot);

      const now = Date.now();
      for (const event of snapshot.events) {
        if (event.compositeScore < 72 && event.severityBand !== "critical") continue;
        const last = wiredRef.current.get(event.id);
        if (last != null && now - last < WIRE_DEDUPE_MS) continue;
        wiredRef.current.set(event.id, now);

        const coin = event.affectedAssets[0] ?? "BTC";
        useMarketAtmosphereStore.getState().ingestIntelligenceWire({
          id: `intel-${event.id}`,
          coin,
          headline: event.summary,
          channel: event.category === "macro" ? "macro" : "market",
          severity: event.severityBand,
          timestamp: event.timestamp,
        });

        terminalBus.emit("intelligence:engine", {
          id: event.id,
          category: event.category,
          severity: event.severityBand,
          summary: event.summary,
          coin,
          compositeScore: event.compositeScore,
        });
      }
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, refresh);
    const unsubIngest = ingestBus.on("ingest:trade", refresh);

    return () => {
      window.clearInterval(id);
      unsubBook();
      unsubIngest();
    };
  }, [enabled]);
}
