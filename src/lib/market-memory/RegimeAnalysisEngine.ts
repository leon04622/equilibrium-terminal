import { regimeClassifier } from "@/lib/quant/RegimeClassifier";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import type { LiquidityRegimeClass, RegimeEpoch, VolatilityRegimeClass } from "@/types/market-memory";

const REGIME_STORAGE = "eq-regime-epochs-v1";

function loadEpochs(): RegimeEpoch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGIME_STORAGE);
    return raw ? (JSON.parse(raw) as RegimeEpoch[]) : [];
  } catch {
    return [];
  }
}

function saveEpochs(epochs: RegimeEpoch[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REGIME_STORAGE, JSON.stringify(epochs.slice(0, 48)));
  } catch {
    /* ignore */
  }
}

export class RegimeAnalysisEngine {
  static classify(asset: string): RegimeEpoch {
    const atmosphere = useMarketAtmosphereStore.getState();
    const book = useTerminalStore.getState().book;
    const bid = book?.bids.reduce((s, l) => s + l.size, 0) ?? 0;
    const ask = book?.asks.reduce((s, l) => s + l.size, 0) ?? 0;
    const imb = bid + ask > 0 ? (bid - ask) / (bid + ask) : 0;

    let derivVol: VolatilityRegimeClass = "normal";
    try {
      const d = DerivativesIntelligenceOrchestrator.snapshot(asset);
      derivVol =
        d.volatility.regime === "stress"
          ? "stress"
          : d.volatility.regime === "expansion"
            ? "expansion"
            : d.volatility.regime === "compression"
              ? "compression"
              : "normal";
    } catch {
      derivVol = atmosphere.stress.score >= 70 ? "stress" : "normal";
    }

    const liquidity: LiquidityRegimeClass =
      book?.spreadBps != null && book.spreadBps > 20
        ? "crisis"
        : book?.spreadBps != null && book.spreadBps > 10
          ? "thin"
          : atmosphere.stress.score >= 60
            ? "balanced"
            : "abundant";

    const regimeLabel = regimeClassifier.classify({
      realizedVol: atmosphere.stress.score / 400,
      bookImbalance: imb,
      liquidationVelocity: atmosphere.regime.regime === "liquidation" ? 0.8 : 0.2,
      fundingDelta: 0.0001,
      spreadBps: book?.spreadBps ?? 5,
    });

    const macro: RegimeEpoch["macro"] =
      atmosphere.regime.regime === "risk-on"
        ? "risk-on"
        : atmosphere.regime.regime === "risk-off" || atmosphere.regime.regime === "liquidation"
          ? "risk-off"
          : "mixed";

    return {
      id: `regime-${Date.now()}`,
      label: regimeLabel.replace(/_/g, " "),
      volatility: derivVol,
      liquidity,
      leverageCycle:
        atmosphere.stress.score >= 65 ? "deleveraging" : atmosphere.stress.score <= 35 ? "building" : "neutral",
      macro,
      narrativeEra: atmosphere.regime.dominantMacro ?? atmosphere.wire[0]?.channel ?? "general",
      startAt: Date.now(),
      endAt: null,
    };
  }

  static epochs(asset: string): RegimeEpoch[] {
    const current = RegimeAnalysisEngine.classify(asset);
    const stored = loadEpochs();
    const last = stored[0];
    if (!last || last.label !== current.label || Date.now() - last.startAt > 120_000) {
      if (last) last.endAt = Date.now();
      const next = [current, ...stored].slice(0, 24);
      saveEpochs(next);
      return next;
    }
    return stored.length ? stored : [current];
  }
}
