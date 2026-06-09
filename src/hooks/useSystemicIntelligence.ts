"use client";

import { useEffect } from "react";
import { GraphIngestPipeline } from "@/lib/knowledge-graph/GraphIngestPipeline";
import { SystemicIntelligenceOrchestrator } from "@/lib/systemic-intelligence/SystemicIntelligenceOrchestrator";
import { useSystemicIntelligenceStore } from "@/store/useSystemicIntelligenceStore";
import { useMarketKnowledgeGraphStore } from "@/store/useMarketKnowledgeGraphStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_500;

export function useSystemicIntelligence(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      GraphIngestPipeline.run();
      const asset = useTerminalStore.getState().selectedCoin;
      useSystemicIntelligenceStore
        .getState()
        .setSnapshot(SystemicIntelligenceOrchestrator.snapshot(asset));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubGraph = useMarketKnowledgeGraphStore.subscribe(
      (s) => s.version,
      () => refresh(),
    );
    const unsubIntel = useTerminalStore.subscribe(
      (s) => s.intelligence.length,
      () => refresh(),
    );
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => refresh());

    return () => {
      window.clearInterval(id);
      unsubGraph();
      unsubIntel();
      unsubCoin();
    };
  }, [enabled]);
}
