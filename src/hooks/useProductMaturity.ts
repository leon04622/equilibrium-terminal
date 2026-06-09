"use client";

import { useEffect } from "react";
import { ProductMaturityOrchestrator } from "@/lib/product-maturity/ProductMaturityOrchestrator";
import { useProductMaturityStore } from "@/store/useProductMaturityStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";

const TICK_MS = 3_000;

export function useProductMaturity(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useProductMaturityStore.getState().setSnapshot(ProductMaturityOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubExp = useTerminalExperienceStore.subscribe(refresh);
    const unsubAdapt = useAdaptiveWorkspaceStore.subscribe(refresh);
    const unsubExec = useExecutionIntelligenceStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubExp();
      unsubAdapt();
      unsubExec();
    };
  }, [enabled]);
}
