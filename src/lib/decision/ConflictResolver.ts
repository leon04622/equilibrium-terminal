import type { DecisionSignal, MarketConflict, SignalDomain } from "@/types/decision-engine";
import type { SignalStance } from "@/types/agentic";

const DOMAIN_PAIRS: [SignalDomain, SignalDomain, string][] = [
  ["orderflow", "macro", "Bullish order flow vs bearish macro regime"],
  ["narrative", "orderflow", "Narrative hype vs weak order flow / liquidity"],
  ["execution", "orderflow", "Momentum breakout vs negative execution quality"],
  ["macro", "narrative", "Macro risk-off vs bullish narrative acceleration"],
  ["volatility", "execution", "Vol expansion vs execution slippage stress"],
];

function domainStance(
  signals: DecisionSignal[],
  domain: SignalDomain,
): SignalStance | null {
  const subset = signals.filter((s) => s.domain === domain);
  if (!subset.length) return null;
  let bull = 0;
  let bear = 0;
  for (const s of subset) {
    const w = s.confidence * s.weight;
    if (s.stance === "bullish") bull += w;
    else if (s.stance === "bearish") bear += w;
  }
  if (bull > bear * 1.2) return "bullish";
  if (bear > bull * 1.2) return "bearish";
  return "neutral";
}

function opposes(a: SignalStance, b: SignalStance): boolean {
  return (
    (a === "bullish" && b === "bearish") || (a === "bearish" && b === "bullish")
  );
}

export class ConflictResolver {
  static resolve(signals: DecisionSignal[]): {
    conflicts: MarketConflict[];
    confidencePenalty: number;
  } {
    const conflicts: MarketConflict[] = [];
    let penalty = 0;

    for (const [dA, dB, template] of DOMAIN_PAIRS) {
      const stanceA = domainStance(signals, dA);
      const stanceB = domainStance(signals, dB);
      if (!stanceA || !stanceB || !opposes(stanceA, stanceB)) continue;

      const severity = 0.4;
      const confidencePenalty = severity * 0.5;
      penalty += confidencePenalty;
      conflicts.push({
        id: `conflict-${dA}-${dB}-${Date.now()}`,
        description: template,
        domains: [dA, dB],
        severity,
        confidencePenalty,
      });
    }

    return {
      conflicts,
      confidencePenalty: Math.min(0.55, penalty),
    };
  }
}
