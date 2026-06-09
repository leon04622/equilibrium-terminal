"use client";

import { useEffect } from "react";
import { OperatorAiOrchestrator } from "@/lib/operator-ai-desk/OperatorAiOrchestrator";
import { useOperatorAiStore } from "@/store/useOperatorAiStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useDecisionEngineStore } from "@/store/useDecisionEngineStore";

const TICK_MS = 3_000;

export function useOperatorAi(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useOperatorAiStore.getState().setSnapshot(OperatorAiOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubTerm = useTerminalStore.subscribe(refresh);
    const unsubDecision = useDecisionEngineStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubTerm();
      unsubDecision();
    };
  }, [enabled]);
}
