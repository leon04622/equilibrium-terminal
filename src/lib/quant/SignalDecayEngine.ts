import type { SignalCandidate, SignalStatus } from "@/types/quant-research";

export interface DecayEvaluation {
  signalId: string;
  previousConfidence: number;
  nextConfidence: number;
  previousStatus: SignalStatus;
  nextStatus: SignalStatus;
  shouldRetire: boolean;
  reason: string;
}

export interface DecayConfig {
  /** Non-linear decay exponent — higher = faster tail-off */
  decayExponent: number;
  sharpeFloorRatio: number;
  winRateFloorRatio: number;
  retireConfidenceFloor: number;
}

const DEFAULT_DECAY: DecayConfig = {
  decayExponent: 1.35,
  sharpeFloorRatio: 0.55,
  winRateFloorRatio: 0.6,
  retireConfidenceFloor: 12,
};

/**
 * Continuous alpha decay boundary — confidence erosion & model retirement.
 */
export class SignalDecayEngine {
  private static instance: SignalDecayEngine | null = null;
  private config: DecayConfig = DEFAULT_DECAY;

  static getInstance(): SignalDecayEngine {
    if (!SignalDecayEngine.instance) {
      SignalDecayEngine.instance = new SignalDecayEngine();
    }
    return SignalDecayEngine.instance;
  }

  setConfig(config: Partial<DecayConfig>): void {
    this.config = { ...this.config, ...config };
  }

  evaluate(signal: SignalCandidate): DecayEvaluation {
    const cfg = this.config;
    const sharpeRatio =
      signal.validationSharpe > 0
        ? signal.liveSharpe / signal.validationSharpe
        : 0;
    const winRateRatio =
      signal.validationWinRate > 0
        ? signal.liveWinRate / signal.validationWinRate
        : 0;

    const sharpeBreach = sharpeRatio < cfg.sharpeFloorRatio;
    const winRateBreach = winRateRatio < cfg.winRateFloorRatio;
    const expectancyBreach = signal.liveExpectancy < signal.decayBoundary;

    let nextConfidence = signal.confidenceIndex;
    let reason = "STABLE";

    if (sharpeBreach || winRateBreach || expectancyBreach) {
      const stress = sharpeBreach
        ? 1 - sharpeRatio
        : winRateBreach
          ? 1 - winRateRatio
          : 0.25;
      const decayFactor = Math.pow(Math.max(0.05, 1 - stress), cfg.decayExponent);
      nextConfidence = Math.max(
        0,
        Math.round(signal.confidenceIndex * decayFactor * 100) / 100,
      );
      reason = sharpeBreach
        ? "SHARPE DECAY"
        : winRateBreach
          ? "WIN RATE DECAY"
          : "EXPECTANCY BREACH";
    }

    let nextStatus: SignalStatus = signal.status;
    if (signal.status === "active" && nextConfidence < signal.confidenceIndex * 0.85) {
      nextStatus = "decaying";
    }
    if (signal.status === "decaying" && nextConfidence < cfg.retireConfidenceFloor * 2) {
      nextStatus = "decaying";
    }

    const shouldRetire =
      nextConfidence <= cfg.retireConfidenceFloor ||
      (signal.status === "decaying" && sharpeRatio < 0.35 && winRateRatio < 0.45);

    if (shouldRetire) {
      nextStatus = "retired";
      nextConfidence = 0;
      reason = "ADMIN RETIREMENT";
    }

    return {
      signalId: signal.id,
      previousConfidence: signal.confidenceIndex,
      nextConfidence,
      previousStatus: signal.status,
      nextStatus,
      shouldRetire,
      reason,
    };
  }

  batchEvaluate(signals: SignalCandidate[]): DecayEvaluation[] {
    return signals
      .filter((s) => s.status === "active" || s.status === "decaying")
      .map((s) => this.evaluate(s));
  }
}

export const signalDecayEngine = SignalDecayEngine.getInstance();
