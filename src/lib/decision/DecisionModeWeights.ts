import type { DecisionTraderMode, SignalDomain } from "@/types/decision-engine";

/** Per-mode domain weight multipliers (0–1.5). */
export const MODE_DOMAIN_WEIGHTS: Record<
  DecisionTraderMode,
  Record<SignalDomain, number>
> = {
  balanced: {
    orderflow: 1,
    macro: 1,
    narrative: 1,
    execution: 1,
    positioning: 1,
    volatility: 1,
    agentic: 1,
    quant: 1,
  },
  scalper: {
    orderflow: 1.4,
    macro: 0.5,
    narrative: 0.4,
    execution: 1.5,
    positioning: 0.7,
    volatility: 1.1,
    agentic: 0.8,
    quant: 0.6,
  },
  swing: {
    orderflow: 0.9,
    macro: 1.1,
    narrative: 1,
    execution: 0.8,
    positioning: 1.2,
    volatility: 0.9,
    agentic: 1,
    quant: 0.9,
  },
  macro: {
    orderflow: 0.6,
    macro: 1.5,
    narrative: 1.1,
    execution: 0.5,
    positioning: 1,
    volatility: 0.8,
    agentic: 0.9,
    quant: 0.7,
  },
  momentum: {
    orderflow: 1.2,
    macro: 0.8,
    narrative: 0.9,
    execution: 1.1,
    positioning: 1.3,
    volatility: 1.2,
    agentic: 1,
    quant: 1.1,
  },
  narrative: {
    orderflow: 0.7,
    macro: 1,
    narrative: 1.5,
    execution: 0.6,
    positioning: 0.9,
    volatility: 0.7,
    agentic: 1.2,
    quant: 0.5,
  },
  quant: {
    orderflow: 0.8,
    macro: 0.9,
    narrative: 0.5,
    execution: 0.9,
    positioning: 1.1,
    volatility: 1,
    agentic: 0.7,
    quant: 1.5,
  },
};

export const MODE_LABELS: Record<DecisionTraderMode, string> = {
  balanced: "BALANCED",
  scalper: "SCALPER",
  swing: "SWING",
  macro: "MACRO",
  momentum: "MOMENTUM",
  narrative: "NARRATIVE",
  quant: "QUANT",
};
