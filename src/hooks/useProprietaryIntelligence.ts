"use client";

import { useEffect, useRef } from "react";
import { ProprietaryIntelligenceOrchestrator } from "@/lib/proprietary";
import { terminalBus } from "@/store/eventBus";
import { useProprietaryIntelligenceStore } from "@/store/useProprietaryIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_500;
const SYNC_MS = 18_000;

export function useProprietaryIntelligence(enabled = true): void {
  const wiredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const snapshot = ProprietaryIntelligenceOrchestrator.snapshot();
      useProprietaryIntelligenceStore.getState().setSnapshot(snapshot);

      for (const m of snapshot.metrics.filter((x) => x.band === "critical")) {
        if (wiredRef.current.has(m.id)) continue;
        wiredRef.current.add(m.id);
        terminalBus.emit("proprietary:metric", {
          id: m.id,
          kind: m.kind,
          label: m.label,
          value: m.value,
          band: m.band,
        });
      }
    };

    refresh();
    const tickId = window.setInterval(refresh, TICK_MS);

    const syncId = window.setInterval(() => {
      const snap = useProprietaryIntelligenceStore.getState().snapshot;
      if (!snap) return;
      void fetch("/api/proprietary/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moatScore: snap.moatScore,
          differentiationScore: snap.differentiationScore,
          metrics: snap.metrics.slice(0, 9),
        }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const offIntel = terminalBus.on("intelligence:engine", refresh);
    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, refresh);
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, refresh);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      offIntel();
      unsubBook();
      unsubConn();
    };
  }, [enabled]);
}
