import type {
  DecisionEntry,
  ExecutionQuality,
  MarketContextStamp,
} from "@/types/operator-journal";

const WINDOW_MS = 5 * 60_000;

export class ExecutionQualityEngine {
  static assess(decisions: DecisionEntry[], context: MarketContextStamp): ExecutionQuality {
    const notes: string[] = [];
    const now = Date.now();
    const recent = decisions.filter((d) => now - d.at < 30 * 60_000);

    // Overtrading: clusters of decisions in a short window.
    const lastWindow = decisions.filter((d) => now - d.at < WINDOW_MS);
    const overtradingPressure = Math.min(1, lastWindow.length / 6);
    if (overtradingPressure > 0.6) notes.push("High decision frequency — possible overtrading.");

    // Low-liquidity execution: entries/exits placed while book was thin/stressed.
    const execDecisions = recent.filter((d) => d.kind === "entry" || d.kind === "exit");
    const lowLiqExec = execDecisions.filter(
      (d) => d.context.liquidityState === "thin" || d.context.liquidityState === "stressed",
    );
    const lowLiquidityExec = execDecisions.length
      ? lowLiqExec.length / execDecisions.length
      : 0;
    if (lowLiquidityExec > 0.4) notes.push("Executing into thin/stressed liquidity repeatedly.");

    // Chase behavior: low-confidence entries during elevated/extreme volatility.
    const chases = execDecisions.filter(
      (d) =>
        d.kind === "entry" &&
        d.confidence <= 2 &&
        (d.context.volatilityState === "elevated" || d.context.volatilityState === "extreme"),
    );
    const chaseRate = execDecisions.length ? chases.length / execDecisions.length : 0;
    if (chaseRate > 0.3) notes.push("Low-conviction entries during volatility expansion (chasing).");

    const slippageBias: ExecutionQuality["slippageBias"] =
      context.liquidityState === "stressed" || (context.spreadBps != null && context.spreadBps > 14)
        ? "adverse"
        : context.liquidityState === "deep" && (context.spreadBps ?? 99) < 4
          ? "favorable"
          : "neutral";

    let score = 100;
    score -= Math.round(overtradingPressure * 30);
    score -= Math.round(lowLiquidityExec * 28);
    score -= Math.round(chaseRate * 26);
    if (slippageBias === "adverse") score -= 10;
    if (slippageBias === "favorable") score += 4;
    score = Math.max(0, Math.min(100, score));

    if (notes.length === 0) notes.push("Execution discipline within healthy range.");

    return {
      score,
      slippageBias,
      chaseRate,
      overtradingPressure,
      lowLiquidityExec,
      notes,
    };
  }
}
