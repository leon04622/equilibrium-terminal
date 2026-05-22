"use client";

import { useEffect } from "react";
import { IntelligenceIndex } from "@/lib/discovery/IntelligenceIndex";
import { MarketSurveillanceEngine } from "@/lib/discovery/MarketSurveillanceEngine";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";

const INDEX_MS = 3_000;
const SURVEILLANCE_MS = 2_000;

export function useInformationDiscovery(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const coin =
        useTerminalStore.getState().selectedCoin ??
        useTerminalStore.getState().selectedAsset?.coin ??
        "BTC";

      useInformationDiscoveryStore.getState().setIndex(IntelligenceIndex.rebuild());
      useInformationDiscoveryStore
        .getState()
        .setSurveillance(MarketSurveillanceEngine.snapshot());
      useInformationDiscoveryStore
        .getState()
        .setAssetTimeline(MarketSurveillanceEngine.buildTimeline(coin));
    };

    useInformationDiscoveryStore.getState().setPipelineActive(true);
    refresh();

    const indexId = window.setInterval(refresh, INDEX_MS);
    const survId = window.setInterval(() => {
      useInformationDiscoveryStore
        .getState()
        .setSurveillance(MarketSurveillanceEngine.snapshot());
    }, SURVEILLANCE_MS);

    const unsub = useTerminalStore.subscribe(
      (s) => s.selectedCoin,
      (coin) => {
        useInformationDiscoveryStore
          .getState()
          .setAssetTimeline(MarketSurveillanceEngine.buildTimeline(coin ?? "BTC"));
      },
    );

    return () => {
      window.clearInterval(indexId);
      window.clearInterval(survId);
      unsub();
      useInformationDiscoveryStore.getState().setPipelineActive(false);
    };
  }, [enabled]);
}
