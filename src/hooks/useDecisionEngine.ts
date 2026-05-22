"use client";

import { useEffect } from "react";
import { DecisionEngine } from "@/lib/decision/DecisionEngine";
import { useDecisionEngineStore } from "@/store/useDecisionEngineStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 5_000;

export interface UseDecisionEngineOptions {
  enabled?: boolean;
}

/**
 * Phase 16 — continuous decision synthesis for active asset.
 */
export function useDecisionEngine(options: UseDecisionEngineOptions = {}) {
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      const coin =
        useTerminalStore.getState().selectedCoin ??
        useTerminalStore.getState().selectedAsset?.symbol ??
        "BTC";
      const mode = useDecisionEngineStore.getState().traderMode;
      const snapshot = DecisionEngine.evaluate(coin, mode);
      useDecisionEngineStore.getState().setSnapshot(snapshot);
    };

    useDecisionEngineStore.getState().setPipelineActive(true);
    run();

    const id = window.setInterval(run, TICK_MS);

    const unsubCoin = useTerminalStore.subscribe(
      (s) => s.selectedCoin,
      () => run(),
    );
    const unsubMode = useDecisionEngineStore.subscribe(
      (s) => s.traderMode,
      () => run(),
    );

    return () => {
      window.clearInterval(id);
      unsubCoin();
      unsubMode();
      useDecisionEngineStore.getState().setPipelineActive(false);
    };
  }, [enabled]);
}
