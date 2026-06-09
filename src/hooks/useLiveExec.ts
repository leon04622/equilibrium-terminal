"use client";

import { useEffect } from "react";
import { LiveExecOrchestrator } from "@/lib/live-exec-desk/LiveExecOrchestrator";
import { useLiveExecStore } from "@/store/useLiveExecStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";

const TICK_MS = 2_000;

export function useLiveExec(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useLiveExecStore.getState().setSnapshot(LiveExecOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubExec = useExecutionIntelligenceStore.subscribe(refresh);
    const unsubWorkflow = useTraderWorkflowStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubExec();
      unsubWorkflow();
    };
  }, [enabled]);
}
