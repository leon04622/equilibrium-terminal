"use client";

import { useEffect } from "react";
import { DeskOpsOrchestrator } from "@/lib/desk-ops/DeskOpsOrchestrator";
import { useDeskOpsStore } from "@/store/useDeskOpsStore";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";

const TICK_MS = 3_000;

export function useDeskOps(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useDeskOpsStore.getState().setSnapshot(DeskOpsOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubProd = useProductionConfigStore.subscribe(refresh);
    const unsubNet = useNetworkGraphStore.subscribe(refresh);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubWorkflow = useTraderWorkflowStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubProd();
      unsubNet();
      unsubTerm();
      unsubWorkflow();
    };
  }, [enabled]);
}
