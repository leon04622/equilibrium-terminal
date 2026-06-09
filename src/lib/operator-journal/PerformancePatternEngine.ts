import type { OperatorSession, PerformancePattern } from "@/types/operator-journal";

function pattern(
  id: string,
  label: string,
  detail: string,
  polarity: PerformancePattern["polarity"],
  confidence: number,
): PerformancePattern {
  return { id, label, detail, polarity, confidence };
}

/** Detects long-term operating tendencies across persisted session history. */
export class PerformancePatternEngine {
  static analyze(history: OperatorSession[]): PerformancePattern[] {
    const completed = history.filter((s) => s.endedAt != null);
    if (completed.length < 2) {
      return [
        pattern(
          "warmup",
          "Building operator baseline",
          `Need more completed sessions (${completed.length}/3) before patterns are reliable.`,
          "neutral",
          30,
        ),
      ];
    }

    const out: PerformancePattern[] = [];

    // Regime participation tendency.
    const regimeCounts = new Map<string, number>();
    for (const s of completed) {
      for (const r of s.regimesParticipated) {
        regimeCounts.set(r, (regimeCounts.get(r) ?? 0) + 1);
      }
    }
    const topRegime = Array.from(regimeCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topRegime) {
      out.push(
        pattern(
          "regime-affinity",
          `Most active in ${topRegime[0]} regimes`,
          `You participate most during ${topRegime[0]} conditions (${topRegime[1]} sessions). Confirm this is your edge, not just comfort.`,
          "neutral",
          60,
        ),
      );
    }

    // Volatility exposure tendency.
    const extremeSessions = completed.filter((s) => s.volatilityExposure.includes("extreme")).length;
    if (extremeSessions / completed.length > 0.5) {
      out.push(
        pattern(
          "vol-exposure",
          "Frequently trades extreme volatility",
          "Over half your sessions touch extreme vol — verify execution holds up or reduce exposure.",
          "weakness",
          55,
        ),
      );
    }

    // Liquidity discipline.
    const stressedLiq = completed.filter((s) => s.liquidityConditions.includes("stressed")).length;
    if (stressedLiq / completed.length > 0.5) {
      out.push(
        pattern(
          "liquidity-discipline",
          "Often operates in stressed liquidity",
          "You frequently trade thin books — a common source of poor fills. Favor limits.",
          "weakness",
          58,
        ),
      );
    } else {
      out.push(
        pattern(
          "liquidity-discipline-good",
          "Generally trades adequate liquidity",
          "You mostly avoid stressed books — good execution hygiene.",
          "strength",
          55,
        ),
      );
    }

    // Session length tendency.
    const avgMin =
      completed.reduce((a, s) => a + s.durationMs, 0) / completed.length / 60_000;
    if (avgMin > 240) {
      out.push(
        pattern(
          "session-length",
          "Long sessions",
          `Average ${Math.round(avgMin)} min/session — watch for fatigue-driven decisions late.`,
          "weakness",
          50,
        ),
      );
    }

    return out;
  }
}
