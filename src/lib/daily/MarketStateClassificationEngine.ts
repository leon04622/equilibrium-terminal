import { LiveDeskClockEngine } from "@/lib/daily/LiveDeskClockEngine";
import { MarketStateLayer } from "@/lib/daily/MarketStateLayer";
import { SessionClockEngine } from "@/lib/daily/SessionClockEngine";
import type { MarketConditionLayer } from "@/types/daily-operations";

export type DeskStateLabel = "CALM" | "ACTIVE" | "THIN" | "STRESS";

export interface SupportingSignal {
  id: string;
  label: string;
  value: string;
}

export interface MarketStateClassification {
  deskState: DeskStateLabel;
  deskTone: string;
  confidence: number;
  supportingSignals: SupportingSignal[];
  layer: MarketConditionLayer;
}

function deskStateFromLayer(layer: MarketConditionLayer, fundingUrgent: boolean): DeskStateLabel {
  if (layer.volatilityState === "extreme") return "STRESS";
  if (layer.volatilityState === "elevated") return "ACTIVE";
  if (layer.liquidityState === "thin" || layer.liquidityState === "stressed") return "THIN";
  if (fundingUrgent) return "ACTIVE";
  return "CALM";
}

function confidenceScore(layer: MarketConditionLayer, deskState: DeskStateLabel): number {
  let score = 62;
  if (deskState === "STRESS" && layer.volatilityState === "extreme") score = 94;
  else if (deskState === "ACTIVE" && layer.volatilityState === "elevated") score = 88;
  else if (deskState === "THIN" && (layer.liquidityState === "thin" || layer.liquidityState === "stressed")) score = 86;
  else if (deskState === "CALM" && layer.volatilityState === "normal" && layer.liquidityState === "deep") score = 91;
  else if (deskState === "CALM" && layer.volatilityState === "compressed") score = 84;
  if (layer.macroRiskLevel === "event") score = Math.min(98, score + 6);
  return score;
}

function supportingSignals(layer: MarketConditionLayer): SupportingSignal[] {
  return [
    { id: "vol", label: "VOLATILITY", value: layer.volatilityState.toUpperCase() },
    { id: "liq", label: "LIQUIDITY", value: layer.liquidityState.toUpperCase() },
    { id: "risk", label: "RISK MODE", value: layer.riskOnOff.toUpperCase() },
    { id: "funding", label: "FUNDING", value: layer.fundingEnvironment.toUpperCase() },
    { id: "macro", label: "MACRO RISK", value: layer.macroRiskLevel.toUpperCase() },
    { id: "breadth", label: "BREADTH", value: `${layer.breadthScore}% advancers` },
  ];
}

export const MarketStateClassificationEngine = {
  classify(now = Date.now()): MarketStateClassification {
    const layer = MarketStateLayer.build();
    const clock = SessionClockEngine.snapshot();
    const pulse = LiveDeskClockEngine.pulse(clock, layer, now);
    const fundingUrgent = pulse.funding.urgent;
    const deskState = deskStateFromLayer(layer, fundingUrgent);

    return {
      deskState,
      deskTone: pulse.deskTone,
      confidence: confidenceScore(layer, deskState),
      supportingSignals: supportingSignals(layer),
      layer,
    };
  },
};
