"use client";

import { useEffect } from "react";
import { MarketScreenerAlertEngine } from "@/lib/institutional/MarketScreenerAlertEngine";
import { useMarketScreenerAlertStore } from "@/store/useMarketScreenerAlertStore";
import { useMarketScreenerStore } from "@/store/useMarketScreenerStore";
import { useAlertStore } from "@/store/useAlertStore";

export function useMarketScreenerAlerts(enabled = true): void {
  const snapshot = useMarketScreenerStore((s) => s.snapshot);
  const savedPresets = useMarketScreenerStore((s) => s.savedPresets);

  useEffect(() => {
    if (!enabled || !snapshot) return;

    const { armed, rules, cooldowns, recordHits } = useMarketScreenerAlertStore.getState();
    if (!armed) return;

    const hits = MarketScreenerAlertEngine.evaluate(
      rules,
      cooldowns,
      savedPresets.map((p) => ({ id: p.id, filter: p.filter })),
    );

    if (!hits.length) return;

    recordHits(hits);

    const dispatch = useAlertStore.getState().dispatchTrigger;
    for (const hit of hits) {
      dispatch({
        id: `screener-${hit.ruleId}-${hit.coin}-${hit.at}`,
        ruleId: `screener-${hit.ruleId}`,
        event: {
          id: `screener-event-${hit.at}-${hit.coin}`,
          type: "SCREENER_HIT",
          coin: hit.coin,
          timestamp: hit.at,
          metrics: {
            changePct: hit.changePct,
            compositeScore: hit.compositeScore,
          },
          meta: {
            ruleLabel: hit.ruleLabel,
            symbol: hit.symbol,
            tags: hit.tags.join(","),
          },
        },
        coin: hit.coin,
        title: `${hit.symbol} · ${hit.ruleLabel}`,
        summary: `${hit.changePct >= 0 ? "+" : ""}${hit.changePct.toFixed(2)}% · score ${hit.compositeScore} · ${hit.tags.join(" · ") || "mover"}`,
        severity: MarketScreenerAlertEngine.severity(hit),
        timestamp: hit.at,
      });
    }
  }, [enabled, snapshot, savedPresets]);
}
