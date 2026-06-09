"use client";

import { useEffect } from "react";
import { GlobalStrategyOrchestrator } from "@/lib/global-strategy";
import { terminalBus } from "@/store/eventBus";
import { useGlobalStrategyStore } from "@/store/useGlobalStrategyStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 10_000;
const SYNC_MS = 60_000;

export function useGlobalStrategy(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = (force = false) => {
      if (!force && document.hidden) return;
      const snapshot = GlobalStrategyOrchestrator.snapshot();
      useGlobalStrategyStore.getState().setSnapshot(snapshot);

      if (snapshot.globalReadinessScore < 45) {
        terminalBus.emit("strategy:readiness", {
          score: snapshot.globalReadinessScore,
          trustScore: snapshot.infrastructureTrustScore,
          severity: "watch",
        });
      }
    };

    refresh(true);
    const tickId = window.setInterval(() => refresh(), TICK_MS);
    const syncId = window.setInterval(() => {
      if (document.hidden) return;
      const snap = useGlobalStrategyStore.getState().snapshot;
      if (!snap) return;
      void fetch("/api/global-strategy/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          infrastructureTrustScore: snap.infrastructureTrustScore,
          globalReadinessScore: snap.globalReadinessScore,
          moatCompositeScore: snap.moatCompositeScore,
        }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, () => refresh());
    const offEco = terminalBus.on("ecosystem:risk", () => refresh());
    const offProp = terminalBus.on("proprietary:metric", () => refresh());

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      unsubConn();
      offEco();
      offProp();
    };
  }, [enabled]);
}
