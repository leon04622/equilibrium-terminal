import type { NormalizedCandle } from "@/types/terminal-schema";
import type { BehavioralFlagKind, DecisionEntry } from "@/types/operator-journal";
import type {
  DecisionReplayBundle,
  DecisionReplayPayload,
  ExecutionReplayMetrics,
  ReplayCoaching,
  ReplayWindowMinutes,
} from "@/types/decision-replay";

const BARS = 60;

/** Deterministic PRNG so the same decision always reconstructs the same window. */
function seeded(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return t / 4294967296;
  };
}

const VOL_AMP: Record<string, number> = {
  compressed: 0.0009,
  normal: 0.0019,
  elevated: 0.0042,
  extreme: 0.0088,
};

const LIQ_DEPTH: Record<string, number> = {
  deep: 92,
  adequate: 70,
  thin: 42,
  stressed: 20,
};

const LIQ_SPREAD: Record<string, number> = {
  deep: 2,
  adequate: 6,
  thin: 13,
  stressed: 22,
};

function driftFor(regime: string): number {
  if (regime === "risk-on") return 0.0006;
  if (regime === "risk-off" || regime === "liquidation") return -0.0009;
  return 0;
}

export class DecisionReplayEngine {
  static buildPayload(
    decision: DecisionEntry,
    flagKind: BehavioralFlagKind | null = null,
  ): DecisionReplayPayload {
    const c = decision.context;
    return {
      decisionId: decision.id,
      at: decision.at,
      asset: decision.coin,
      kind: decision.kind,
      confidence: decision.confidence,
      emotion: decision.emotion,
      thesis: decision.thesis,
      riskNote: decision.riskNote,
      regime: c.regime,
      volatilityState: c.volatilityState,
      liquidityState: c.liquidityState,
      fundingEnvironment: c.fundingEnvironment,
      spreadBps: c.spreadBps,
      markPrice: c.markPrice,
      session: c.session,
      label: c.label,
      flagKind,
    };
  }

  static buildBundle(
    payload: DecisionReplayPayload,
    windowMinutes: ReplayWindowMinutes,
  ): DecisionReplayBundle {
    const totalMs = windowMinutes * 60_000;
    const beforeMs = Math.round(totalMs / 3); // 1/3 before, 2/3 after
    const barMs = Math.round(totalMs / BARS);
    const decisionIndex = Math.round(BARS * (beforeMs / totalMs));
    const startTime = payload.at - beforeMs;

    const rng = seeded(payload.decisionId + windowMinutes);
    const amp = VOL_AMP[payload.volatilityState] ?? VOL_AMP.normal;
    const drift = driftFor(payload.regime);
    const anchor = payload.markPrice && payload.markPrice > 0 ? payload.markPrice : 100;

    // Build a continuous close path, then derive OHLC bars.
    const candles: NormalizedCandle[] = [];
    let price = anchor * (1 - drift * decisionIndex - amp * 1.5); // start so decision lands near anchor
    const baseVol = (LIQ_DEPTH[payload.liquidityState] ?? 60) * 12;

    for (let i = 0; i < BARS; i++) {
      const open = price;
      // Extra expansion in the bars right around the decision moment.
      const proximity = 1 - Math.min(1, Math.abs(i - decisionIndex) / 8);
      const localAmp = amp * (1 + proximity * 0.9);
      const shock = (rng() - 0.5) * 2 * localAmp;
      const step = drift + shock;
      const close = Math.max(0.0001, open * (1 + step));
      const wick = open * localAmp * (0.5 + rng());
      const high = Math.max(open, close) + wick;
      const low = Math.min(open, close) - wick;
      const volume = Math.round(baseVol * (0.6 + rng() + proximity * 1.2));
      candles.push({
        time: startTime + i * barMs,
        open,
        high,
        low,
        close,
        volume,
      });
      price = close;
    }

    const decisionClose = candles[decisionIndex]?.close ?? anchor;
    const firstClose = candles[0]?.close ?? anchor;
    const lastClose = candles[candles.length - 1]?.close ?? anchor;
    const priceMoveBeforePct = ((decisionClose - firstClose) / firstClose) * 100;
    const priceMoveAfterPct = ((lastClose - decisionClose) / decisionClose) * 100;

    const execution = this.executionMetrics(payload);
    const coaching = this.coaching(payload, priceMoveBeforePct, priceMoveAfterPct, windowMinutes);
    const behavioralHighlight = this.behavioralHighlight(payload.flagKind);

    return {
      payload,
      candles,
      decisionIndex,
      coaching,
      execution,
      behavioralHighlight,
      windowMinutes,
      priceMoveAfterPct,
      priceMoveBeforePct,
    };
  }

  private static executionMetrics(payload: DecisionReplayPayload): ExecutionReplayMetrics {
    const applicable =
      payload.kind === "entry" || payload.kind === "exit" || payload.kind === "adjust";
    const spreadBps = payload.spreadBps ?? LIQ_SPREAD[payload.liquidityState] ?? 8;
    const depthScore = LIQ_DEPTH[payload.liquidityState] ?? 60;
    const volPenalty =
      payload.volatilityState === "extreme" ? 6 : payload.volatilityState === "elevated" ? 3 : 0;
    const slippageEstBps = Math.round((spreadBps / 2 + volPenalty) * 10) / 10;

    const chaseRisk: ExecutionReplayMetrics["chaseRisk"] =
      payload.volatilityState === "extreme" && payload.confidence <= 2
        ? "high"
        : payload.volatilityState === "extreme" || payload.volatilityState === "elevated"
          ? "elevated"
          : "low";

    const timingQuality = !applicable
      ? "Non-execution decision — timing not graded."
      : depthScore >= 70 && spreadBps <= 8
        ? "Favorable — deep book, tight spread at decision."
        : depthScore <= 40 || spreadBps >= 16
          ? "Poor — thin book / wide spread raised fill risk."
          : "Acceptable — average execution conditions.";

    return { applicable, spreadBps, depthScore, slippageEstBps, chaseRisk, timingQuality };
  }

  private static coaching(
    p: DecisionReplayPayload,
    beforePct: number,
    afterPct: number,
    windowMinutes: ReplayWindowMinutes,
  ): ReplayCoaching {
    const afterMin = Math.round((windowMinutes * 2) / 3);
    const before =
      `Leading into the decision the tape was ${p.regime} with ${p.volatilityState} volatility. ` +
      `Price moved ${beforePct >= 0 ? "+" : ""}${beforePct.toFixed(2)}% in the window before you acted.`;

    const atPoint =
      `At the decision point liquidity was ${p.liquidityState} and spread was ` +
      `${p.spreadBps != null ? `${p.spreadBps.toFixed(1)} bps` : "unrecorded"}. ` +
      `You logged a ${p.kind} with confidence ${p.confidence}/5 while feeling "${p.emotion}".`;

    const after =
      `Over the ~${afterMin} min after, price moved ${afterPct >= 0 ? "+" : ""}${afterPct.toFixed(2)}%. ` +
      `Review whether that move validated or invalidated your thesis.`;

    const liquidityVerdict =
      p.liquidityState === "deep" || p.liquidityState === "adequate"
        ? { tone: "good" as const, text: "Liquidity supported the decision — fills should have been clean." }
        : p.liquidityState === "thin"
          ? { tone: "neutral" as const, text: "Liquidity was thin — fills may have slipped." }
          : { tone: "poor" as const, text: "Liquidity was stressed — execution risk was high here." };

    const volatilityVerdict =
      p.volatilityState === "extreme"
        ? { tone: "poor" as const, text: "Extreme volatility — risk of adverse excursion was elevated." }
        : p.volatilityState === "elevated"
          ? { tone: "neutral" as const, text: "Elevated volatility — sizing discipline mattered here." }
          : { tone: "good" as const, text: "Calm/normal volatility — a controlled environment to act in." };

    const spreadBps = p.spreadBps ?? LIQ_SPREAD[p.liquidityState] ?? 8;
    const spreadVerdict =
      spreadBps <= 6
        ? { tone: "good" as const, text: `Spread ~${spreadBps.toFixed(1)} bps — favorable cost to cross.` }
        : spreadBps <= 14
          ? { tone: "neutral" as const, text: `Spread ~${spreadBps.toFixed(1)} bps — moderate crossing cost.` }
          : { tone: "poor" as const, text: `Spread ~${spreadBps.toFixed(1)} bps — expensive; market orders bled edge.` };

    const reviewPrompt =
      p.kind === "skip"
        ? "Was this a valid setup you passed on, or a disciplined skip? Note which."
        : "Did the market conditions justify this decision, or was it driven by the emotion you tagged?";

    return { before, atPoint, after, liquidityVerdict, volatilityVerdict, spreadVerdict, reviewPrompt };
  }

  private static behavioralHighlight(flagKind: BehavioralFlagKind | null): string | null {
    if (!flagKind) return null;
    switch (flagKind) {
      case "revenge_trading":
        return "Flagged for revenge trading — entries fired in quick succession while frustrated/FOMO.";
      case "overtrading":
        return "Flagged for overtrading — a cluster of decisions occurred in a short window.";
      case "volatility_chasing":
        return "Flagged for volatility chasing — low-conviction entry during a volatility expansion.";
      case "poor_liquidity_exec":
        return "Flagged for poor-liquidity execution — acted into a thin/stressed book.";
      case "oversized_risk":
        return "Flagged for oversized risk — position size exceeded discipline guidelines.";
      case "emotional_deterioration":
        return "Flagged for emotional deterioration — confidence trended lower across recent decisions.";
      default:
        return null;
    }
  }
}
