"use client";

import { useEffect, useRef } from "react";
import { InformationDistributionOrchestrator } from "@/lib/distribution";
import { NotificationDeliveryEngine } from "@/lib/distribution/NotificationDeliveryEngine";
import { terminalBus } from "@/store/eventBus";
import { useInformationDistributionStore } from "@/store/useInformationDistributionStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_000;

export function useInformationDistribution(enabled = true): void {
  const lastCriticalRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    useInformationDistributionStore.getState().hydratePrefs();

    const refresh = () => {
      const snapshot = InformationDistributionOrchestrator.snapshot();
      useInformationDistributionStore.getState().setSnapshot(snapshot);

      for (const item of snapshot.newswire) {
        if (item.severity !== "critical") continue;
        if (lastCriticalRef.current.has(item.id)) continue;
        lastCriticalRef.current.add(item.id);
        terminalBus.emit("distribution:event", {
          id: item.id,
          category: item.category,
          severity: item.severity,
          headline: item.headline,
          coin: item.coin,
        });
        void NotificationDeliveryEngine.dispatchCritical(item);
      }

      for (const inc of snapshot.incidents.filter((i) => i.severity === "critical")) {
        terminalBus.emit("distribution:incident", {
          id: inc.id,
          kind: inc.kind,
          severity: inc.severity,
          headline: inc.headline,
        });
      }
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const syncId = window.setInterval(() => {
      const snap = useInformationDistributionStore.getState().snapshot;
      if (!snap?.newswire.length) return;
      void fetch("/api/distribution/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: snap.newswire.slice(0, 32) }),
      }).catch(() => undefined);
    }, 15_000);

    const offAlert = terminalBus.on("alert:triggered", refresh);
    const offStream = terminalBus.on("stream:status", refresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, refresh);
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, refresh);

    return () => {
      window.clearInterval(id);
      window.clearInterval(syncId);
      offAlert();
      offStream();
      unsubIntel();
      unsubConn();
    };
  }, [enabled]);
}
