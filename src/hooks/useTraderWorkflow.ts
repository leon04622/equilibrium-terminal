"use client";

import { useEffect } from "react";
import { AlertWorkflowBridge } from "@/lib/workflow/AlertWorkflowBridge";
import { SessionContinuity } from "@/lib/workflow/SessionContinuity";
import { WatchlistIntelligence } from "@/lib/workflow/WatchlistIntelligence";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";

const INTEL_MS = 5_000;

export function useTraderWorkflow(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const saved = SessionContinuity.load();
    if (saved) {
      useTraderWorkflowStore.getState().hydrate({
        journal: saved.journal,
        theses: saved.theses,
        savedViews: saved.savedViews,
      });
      if (saved.session.selectedCoin) {
        useTerminalStore.getState().selectAssetByCoin(saved.session.selectedCoin, "session-restore");
      }
      if (saved.session.assetWorkspaceMode) {
        useTraderWorkflowStore
          .getState()
          .setAssetWorkspaceMode(saved.session.assetWorkspaceMode);
      }
    } else {
      useTraderWorkflowStore.getState().hydrate({ journal: [], theses: [], savedViews: [] });
    }

    const unsubAlert = AlertWorkflowBridge.start();

    const intelId = window.setInterval(() => {
      useTraderWorkflowStore.getState().setWatchlistIntel(WatchlistIntelligence.enrich());
    }, INTEL_MS);
    useTraderWorkflowStore.getState().setWatchlistIntel(WatchlistIntelligence.enrich());

    const persistId = window.setInterval(() => {
      useTraderWorkflowStore.getState().persist();
    }, 30_000);

    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => {
      useTraderWorkflowStore.getState().persist();
    });

    return () => {
      unsubAlert();
      window.clearInterval(intelId);
      window.clearInterval(persistId);
      unsubCoin();
      useTraderWorkflowStore.getState().persist();
    };
  }, [enabled]);
}
