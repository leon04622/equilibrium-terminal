"use client";

import { useEffect } from "react";
import { LiveDeploymentOrchestrator } from "@/lib/live-deployment/LiveDeploymentOrchestrator";
import { useLiveDeploymentStore } from "@/store/useLiveDeploymentStore";
import { useAlphaStore } from "@/store/useAlphaStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;

export function useLiveDeployment(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useLiveDeploymentStore.getState().setSnapshot(LiveDeploymentOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubAlpha = useAlphaStore.subscribe(refresh);
    const unsubTel = useTraderTelemetryStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubAlpha();
      unsubTel();
    };
  }, [enabled]);
}
