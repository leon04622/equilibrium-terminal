"use client";

import { useEffect } from "react";
import { IntegrationsOrchestrator } from "@/lib/integrations";
import { terminalBus } from "@/store/eventBus";
import { useIndustryIntegrationsStore } from "@/store/useIndustryIntegrationsStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 8_000;
const SYNC_MS = 60_000;

export function useIndustryIntegrations(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = (force = false) => {
      if (!force && document.hidden) return;
      const snapshot = IntegrationsOrchestrator.snapshot();
      useIndustryIntegrationsStore.getState().setSnapshot(snapshot);

      for (const brief of snapshot.publicBriefs.filter((b) => b.severity === "critical")) {
        terminalBus.emit("integrations:public", {
          id: brief.id,
          headline: brief.headline,
          category: brief.category,
        });
      }
    };

    refresh(true);
    const tickId = window.setInterval(() => refresh(), TICK_MS);

    const syncId = window.setInterval(() => {
      if (document.hidden) return;
      const snap = useIndustryIntegrationsStore.getState().snapshot;
      if (!snap) return;
      void fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationScore: snap.integrationScore,
          liveVenues: snap.exchanges.filter((e) => e.status === "live").length,
          apiEndpoints: snap.apiEndpoints.length,
        }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, () => refresh());
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, () => refresh());
    const unsubProd = useProductionConfigStore.subscribe((s) => s.vitals.updatedAt, () => refresh());

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      unsubBook();
      unsubConn();
      unsubProd();
    };
  }, [enabled]);
}
