import type { MarketRegime } from "@/types/quant-research";

export interface RegimeInputs {
  realizedVol: number;
  bookImbalance: number;
  liquidationVelocity: number;
  fundingDelta: number;
  spreadBps: number;
}

/**
 * Structural market state classifier — partitions tape into discrete regimes.
 */
export class RegimeClassifier {
  private static instance: RegimeClassifier | null = null;

  static getInstance(): RegimeClassifier {
    if (!RegimeClassifier.instance) {
      RegimeClassifier.instance = new RegimeClassifier();
    }
    return RegimeClassifier.instance;
  }

  classify(inputs: RegimeInputs): MarketRegime {
    const absImb = Math.abs(inputs.bookImbalance);
    const vol = inputs.realizedVol;

    if (inputs.liquidationVelocity >= 0.65 && vol >= 0.02) {
      return "LIQUIDATION_CASCADE";
    }

    if (vol >= 0.035 && absImb >= 0.25 && inputs.spreadBps <= 8) {
      return "HIGH_VOLATILITY_SQUEEZE";
    }

    if (vol <= 0.012 && absImb <= 0.12 && Math.abs(inputs.fundingDelta) < 0.0002) {
      return "LOW_VOLATILITY_MEAN_REVERTING";
    }

    if (vol >= 0.018 && absImb >= 0.18 && inputs.fundingDelta > 0) {
      return "TREND_EXPANSION";
    }

    if (vol <= 0.02 && absImb <= 0.2) {
      return "RANGE_BOUND";
    }

    return "UNKNOWN";
  }

  partitionEventsByRegime<T extends { regime: MarketRegime }>(
    events: T[],
  ): Map<MarketRegime, T[]> {
    const map = new Map<MarketRegime, T[]>();
    for (const ev of events) {
      const bucket = map.get(ev.regime) ?? [];
      bucket.push(ev);
      map.set(ev.regime, bucket);
    }
    return map;
  }
}

export const regimeClassifier = RegimeClassifier.getInstance();
