"use client";

import { useEffect } from "react";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";

const SPREAD_OK_BPS = 14;
const MIN_TOP_DEPTH = 0.35;

/**
 * Bloomberg-style pre-trade sensors — auto-complete operator checks from live Hyperbook.
 */
export function useOperatorBookSensors(enabled = true): void {
  const book = useHyperliquidStore((s) => s.book);
  const stress = useMarketAtmosphereStore((s) => s.stress);
  const regime = useMarketAtmosphereStore((s) => s.regime.regime);
  const autoCompleteTrading = useOperatorModeStore((s) => s.autoCompleteTrading);

  useEffect(() => {
    if (!enabled) return;
    const state = useOperatorModeStore.getState();
    if (!state.active || !(state.proCaps.orderBookChecks || state.proCaps.executionGuidance)) return;

    const spreadBps = book?.spreadBps ?? null;
    const topDepth = Math.min(book?.maxBidSize ?? 0, book?.maxAskSize ?? 0);

    if (spreadBps != null && spreadBps <= SPREAD_OK_BPS) {
      autoCompleteTrading("spread");
    }
    if (topDepth >= MIN_TOP_DEPTH && book?.mid) {
      autoCompleteTrading("liquidity");
    }
    if (stress.score <= 68) {
      autoCompleteTrading("volatility");
    }
    if (regime) {
      autoCompleteTrading("market-state");
    }
  }, [
    enabled,
    book?.spreadBps,
    book?.maxBidSize,
    book?.maxAskSize,
    book?.mid,
    stress.score,
    regime,
    autoCompleteTrading,
  ]);
}
