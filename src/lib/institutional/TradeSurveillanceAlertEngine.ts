import {
  BUILTIN_TRADE_SURVEILLANCE_RULES,
  type TradeSurveillanceHit,
  type TradeSurveillanceRule,
  type TradeSurveillanceSignalKind,
  type TradeSurveillanceSnapshot,
} from "@/types/institutional-capabilities";
import type { AlertSeverity } from "@/types/alerts";

function scoreForSignal(
  snap: TradeSurveillanceSnapshot,
  signal: TradeSurveillanceSignalKind,
): number {
  switch (signal) {
    case "spoof":
      return snap.spoofScore;
    case "wash":
      return snap.washScore;
    case "layering":
      return snap.layeringScore;
    case "toxic_flow":
      return snap.toxicFlowScore;
    case "sweep_cluster":
      return snap.sweepCount;
    default:
      return 0;
  }
}

export class TradeSurveillanceAlertEngine {
  static evaluate(
    snap: TradeSurveillanceSnapshot,
    rules: TradeSurveillanceRule[],
    cooldowns: Map<string, number>,
  ): TradeSurveillanceHit[] {
    const hits: TradeSurveillanceHit[] = [];
    const now = Date.now();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const score = scoreForSignal(snap, rule.signal);
      if (score < rule.minScore) continue;

      const cooldownKey = `${rule.id}:${snap.coin}`;
      const last = cooldowns.get(cooldownKey) ?? 0;
      if (now - last < rule.cooldownMs) continue;

      hits.push({
        ruleId: rule.id,
        ruleLabel: rule.label,
        signal: rule.signal,
        coin: snap.coin,
        score,
        at: now,
      });
      cooldowns.set(cooldownKey, now);
    }

    return hits;
  }

  static severity(hit: TradeSurveillanceHit): AlertSeverity {
    if (hit.signal === "toxic_flow" && hit.score >= 70) return "critical";
    if (hit.score >= 75 || hit.signal === "sweep_cluster") return "watch";
    return "info";
  }

  static defaultRules(): TradeSurveillanceRule[] {
    return BUILTIN_TRADE_SURVEILLANCE_RULES.map((r) => ({ ...r }));
  }
}
