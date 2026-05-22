"use client";

import { useEffect } from "react";
import { EnterpriseOrchestrator } from "@/lib/enterprise";
import { terminalBus } from "@/store/eventBus";
import { useEnterpriseOpsStore } from "@/store/useEnterpriseOpsStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;
const SYNC_MS = 20_000;

export function useEnterpriseOperations(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const entitled = useProductionConfigStore.getState().isEntitled("enterpriseOpsEnabled");

    const refresh = () => {
      const snapshot = EnterpriseOrchestrator.snapshot();
      useEnterpriseOpsStore.getState().setSnapshot(snapshot);

      for (const notice of snapshot.notices.filter((n) => n.severity === "critical")) {
        terminalBus.emit("enterprise:notice", {
          id: notice.id,
          kind: notice.kind,
          headline: notice.headline,
          severity: notice.severity,
        });
      }
    };

    if (entitled) refresh();
    const tickId = window.setInterval(() => {
      if (useProductionConfigStore.getState().isEntitled("enterpriseOpsEnabled")) refresh();
    }, TICK_MS);

    const syncId = window.setInterval(() => {
      const snap = useEnterpriseOpsStore.getState().snapshot;
      if (!snap || !entitled) return;
      void fetch("/api/enterprise/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: snap.organization.tenantId,
          operationalScore: snap.operationalScore,
          auditCount: snap.auditTrail.length,
        }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const unsubPos = useTerminalStore.subscribe((s) => s.positionsVersion, refresh);
    const unsubProd = useProductionConfigStore.subscribe((s) => s.vitals.updatedAt, refresh);
    const offAlert = terminalBus.on("alert:triggered", refresh);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      unsubPos();
      unsubProd();
      offAlert();
    };
  }, [enabled]);
}
