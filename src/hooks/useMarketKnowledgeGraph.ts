"use client";

import { useEffect } from "react";
import { AssetIntelligenceHubBuilder } from "@/lib/knowledge-graph/AssetIntelligenceHubBuilder";
import { CrossMarketEngine } from "@/lib/knowledge-graph/CrossMarketEngine";
import { GraphIngestPipeline } from "@/lib/knowledge-graph/GraphIngestPipeline";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { useMarketKnowledgeGraphStore } from "@/store/useMarketKnowledgeGraphStore";
import { useTerminalStore } from "@/store/terminalStore";

const INGEST_MS = 4_000;

export function useMarketKnowledgeGraph(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      GraphIngestPipeline.run();
      const snap = marketKnowledgeGraph.snapshot();
      useMarketKnowledgeGraphStore.getState().setSnapshot(snap);
      useMarketKnowledgeGraphStore.getState().setCrossMarket(CrossMarketEngine.analyze());

      const coin =
        useTerminalStore.getState().selectedCoin ??
        useTerminalStore.getState().selectedAsset?.coin ??
        "BTC";
      useMarketKnowledgeGraphStore
        .getState()
        .setAssetHub(AssetIntelligenceHubBuilder.build(coin));
      useMarketKnowledgeGraphStore.getState().bumpVersion();
    };

    useMarketKnowledgeGraphStore.getState().setPipelineActive(true);
    tick();
    const id = window.setInterval(tick, INGEST_MS);

    const unsub = useTerminalStore.subscribe((s) => s.selectedCoin, (coin) => {
      if (!coin) return;
      useMarketKnowledgeGraphStore
        .getState()
        .setAssetHub(AssetIntelligenceHubBuilder.build(coin));
      useMarketKnowledgeGraphStore.getState().bumpVersion();
    });

    return () => {
      window.clearInterval(id);
      unsub();
      useMarketKnowledgeGraphStore.getState().setPipelineActive(false);
    };
  }, [enabled]);
}
