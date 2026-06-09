import type { BehavioralFlag, DecisionEntry } from "@/types/operator-journal";

function flag(
  kind: BehavioralFlag["kind"],
  severity: BehavioralFlag["severity"],
  message: string,
): BehavioralFlag {
  return { id: `${kind}-${Date.now()}`, kind, severity, message, at: Date.now() };
}

export class BehavioralDetectionEngine {
  static detect(decisions: DecisionEntry[]): BehavioralFlag[] {
    const flags: BehavioralFlag[] = [];
    const now = Date.now();
    const recent = decisions.filter((d) => now - d.at < 20 * 60_000);

    // Overtrading — too many decisions in 5 min.
    const fast = decisions.filter((d) => now - d.at < 5 * 60_000);
    if (fast.length >= 5) {
      flags.push(
        flag("overtrading", "watch", `${fast.length} decisions in 5 min — slow down and reset.`),
      );
    }

    // Revenge trading — frustrated/anxious entries firing in quick succession.
    const tilt = recent.filter(
      (d) => (d.emotion === "frustrated" || d.emotion === "fomo") && d.kind === "entry",
    );
    if (tilt.length >= 2) {
      flags.push(
        flag(
          "revenge_trading",
          "critical",
          "Multiple entries while frustrated/FOMO — classic revenge-trade pattern.",
        ),
      );
    }

    // Volatility chasing — low confidence entries in extreme vol.
    const chasing = recent.filter(
      (d) => d.kind === "entry" && d.confidence <= 2 && d.context.volatilityState === "extreme",
    );
    if (chasing.length >= 1) {
      flags.push(
        flag("volatility_chasing", "watch", "Chasing entries in extreme volatility with low conviction."),
      );
    }

    // Poor liquidity execution.
    const poorLiq = recent.filter(
      (d) =>
        (d.kind === "entry" || d.kind === "exit") &&
        d.context.liquidityState === "stressed",
    );
    if (poorLiq.length >= 2) {
      flags.push(
        flag("poor_liquidity_exec", "watch", "Executing into stressed liquidity — expect adverse fills."),
      );
    }

    // Emotional deterioration — confidence trending down across recent decisions.
    if (recent.length >= 3) {
      const conf = recent.slice(0, 3).map((d) => d.confidence);
      if (conf[0] < conf[2]) {
        flags.push(
          flag("emotional_deterioration", "info", "Confidence trending lower — consider a reset break."),
        );
      }
    }

    return flags;
  }
}
