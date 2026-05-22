"use client";

import { useEffect } from "react";
import { CryptoEcosystemOrchestrator } from "@/lib/ecosystem";
import { terminalBus } from "@/store/eventBus";
import { useCryptoEcosystemStore } from "@/store/useCryptoEcosystemStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;
const SYNC_MS = 20_000;

export function useCryptoEcosystem(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const snapshot = CryptoEcosystemOrchestrator.snapshot();
      useCryptoEcosystemStore.getState().setSnapshot(snapshot);

      for (const alert of snapshot.riskAlerts.filter((a) => a.severity === "critical")) {
        terminalBus.emit("ecosystem:risk", {
          id: alert.id,
          headline: alert.headline,
          severity: alert.severity,
        });
      }
    };

    refresh();
    const tickId = window.setInterval(refresh, TICK_MS);
    const syncId = window.setInterval(() => {
      const snap = useCryptoEcosystemStore.getState().snapshot;
      if (!snap) return;
      void fetch("/api/ecosystem/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ecosystemScore: snap.ecosystemScore,
          operatingReadiness: snap.operatingReadiness,
          layerCount: snap.layers.filter((l) => l.health === "operational").length,
        }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const unsubPos = useTerminalStore.subscribe((s) => s.positionsVersion, refresh);
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, refresh);
    const offAlert = terminalBus.on("alert:triggered", refresh);
    const offProp = terminalBus.on("proprietary:metric", refresh);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      unsubPos();
      unsubConn();
      offAlert();
      offProp();
    };
  }, [enabled]);
}
