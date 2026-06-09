"use client";

import { useEffect } from "react";
import { ResearchDeskOrchestrator } from "@/lib/research-desk/ResearchDeskOrchestrator";
import { useResearchDeskStore } from "@/store/useResearchDeskStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_500;

export function useResearchDesk(enabled = true): void {
  const searchQuery = useResearchDeskStore((s) => s.searchQuery);

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      const q = useResearchDeskStore.getState().searchQuery;
      useResearchDeskStore
        .getState()
        .setSnapshot(ResearchDeskOrchestrator.snapshot(asset, q));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubJournal = useTraderWorkflowStore.subscribe((s) => s.journal.length, refresh);
    const unsubThesis = useTraderWorkflowStore.subscribe((s) => s.theses.length, refresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, refresh);
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, refresh);

    return () => {
      window.clearInterval(id);
      unsubJournal();
      unsubThesis();
      unsubIntel();
      unsubCoin();
    };
  }, [enabled, searchQuery]);
}
