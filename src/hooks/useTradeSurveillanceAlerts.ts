"use client";

import { useEffect } from "react";
import { TradeSurveillanceAlertEngine } from "@/lib/institutional/TradeSurveillanceAlertEngine";
import { TradeSurveillanceEngine } from "@/lib/institutional/TradeSurveillanceEngine";
import { useTradeSurveillanceAlertStore } from "@/store/useTradeSurveillanceAlertStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useAlertStore } from "@/store/useAlertStore";

export function useTradeSurveillanceAlerts(enabled = true): void {
  const matrixVersion = useExecutionIntelligenceStore((s) => s.matrixVersion);
  const pipelineActive = useExecutionIntelligenceStore((s) => s.pipelineActive);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin) ?? "BTC";

  useEffect(() => {
    if (!enabled || !pipelineActive) return;

    const snap = TradeSurveillanceEngine.snapshot(selectedCoin);
    const { armed, rules, cooldowns, recordHits } = useTradeSurveillanceAlertStore.getState();
    if (!armed) return;

    const hits = TradeSurveillanceAlertEngine.evaluate(snap, rules, cooldowns);
    if (!hits.length) return;

    recordHits(hits);

    const dispatch = useAlertStore.getState().dispatchTrigger;
    for (const hit of hits) {
      dispatch({
        id: `trade-surveillance-${hit.ruleId}-${hit.coin}-${hit.at}`,
        ruleId: `trade-surveillance-${hit.ruleId}`,
        event: {
          id: `trade-surveillance-event-${hit.at}-${hit.coin}`,
          type: "TRADE_SURVEILLANCE_HIT",
          coin: hit.coin,
          timestamp: hit.at,
          metrics: {
            score: hit.score,
            compositeRisk: snap.compositeRisk,
            spoofScore: snap.spoofScore,
            washScore: snap.washScore,
          },
          meta: {
            ruleLabel: hit.ruleLabel,
            signal: hit.signal,
          },
        },
        coin: hit.coin,
        title: `${hit.coin} · ${hit.ruleLabel}`,
        summary: `${hit.signal.replace("_", " ")} score ${hit.score} · composite risk ${snap.compositeRisk}`,
        severity: TradeSurveillanceAlertEngine.severity(hit),
        timestamp: hit.at,
      });
    }
  }, [enabled, matrixVersion, pipelineActive, selectedCoin]);
}
