"use client";

import { useEffect, useRef } from "react";
import { featurePipeline } from "@/lib/quant/FeaturePipeline";
import { useQuantResearchStore, tickSignalDecay } from "@/store/useQuantResearchStore";
import { useTerminalStore } from "@/store/terminalStore";

const DECAY_INTERVAL_MS = 15_000;
const EXTRACT_INTERVAL_MS = 800;

/**
 * Boots Phase 12 quant research — feature pipeline off React, decay governance loop.
 */
export function useQuantResearch(enabled = true): void {
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const bookVersion = useTerminalStore((s) => s.bookVersion);
  const tradesLen = useTerminalStore((s) => s.trades.length);
  const fundingRef = useRef(0.0001);

  useEffect(() => {
    if (!enabled) return;
    let decayTimer: number | null = null;
    const bootId = window.setTimeout(() => {
      useQuantResearchStore.getState().setPipelineActive(true);
      featurePipeline.start(({ coin, features, cycleMs }) => {
        useQuantResearchStore.getState().upsertFeatureRow(coin, features);
        useQuantResearchStore.getState().recordFeatureBatch(features.length, cycleMs);
      });
      decayTimer = window.setInterval(() => {
        tickSignalDecay();
      }, DECAY_INTERVAL_MS);
    }, 0);

    return () => {
      window.clearTimeout(bootId);
      if (decayTimer) window.clearInterval(decayTimer);
      featurePipeline.stop();
      useQuantResearchStore.getState().setPipelineActive(false);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const extract = () => {
      const state = useTerminalStore.getState();
      const coin = state.selectedCoin;
      const book = state.book;
      const recentTrades = state.trades.slice(0, 40);
      const fundingRate = fundingRef.current;
      const prevFundingRate = fundingRef.current * 0.998;
      fundingRef.current = fundingRate + (book?.mid ?? 0) * 0.00000001;

      featurePipeline.enqueue({
        coin,
        book,
        recentTrades,
        fundingRate,
        prevFundingRate,
      });
    };

    extract();
    const id = window.setInterval(extract, EXTRACT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [enabled, selectedCoin, bookVersion, tradesLen]);
}
