"use client";

import { useEffect } from "react";
import { UnifiedOpsOrchestrator } from "@/lib/unified-ops/UnifiedOpsOrchestrator";
import { useUnifiedOpsStore } from "@/store/useUnifiedOpsStore";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";

const TICK_MS = 3_000;

export function useUnifiedOps(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useUnifiedOpsStore.getState().setSnapshot(UnifiedOpsOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubAdapt = useAdaptiveWorkspaceStore.subscribe(refresh);
    const unsubWorkflow = useTraderWorkflowStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubAdapt();
      unsubWorkflow();
    };
  }, [enabled]);
}
