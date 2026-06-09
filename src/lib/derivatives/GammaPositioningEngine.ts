import { OptionsAnalyticsEngine } from "@/lib/derivatives/OptionsAnalyticsEngine";
import { OptionsIngestionEngine } from "@/lib/derivatives/OptionsIngestionEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { GammaPositioning } from "@/types/derivatives-intelligence";

export class GammaPositioningEngine {
  static analyze(asset: string): GammaPositioning {
    const chain = OptionsIngestionEngine.chain(asset);
    const options = OptionsAnalyticsEngine.analyze(asset);
    const mid = useTerminalStore.getState().book?.mid ?? options.maxPainStrike;

    let netGamma = 0;
    for (const r of chain) {
      const sign = r.side === "call" ? 1 : -1;
      netGamma += r.gamma * r.openInterest * sign;
    }
    netGamma = Math.round(netGamma * 100) / 100;

    const dealerGammaBias: GammaPositioning["dealerGammaBias"] =
      netGamma > 500 ? "long_gamma" : netGamma < -500 ? "short_gamma" : "neutral";

    const squeezeRiskScore = Math.min(
      100,
      Math.round(
        options.oiConcentrationScore * 0.4 +
          Math.abs(netGamma) / 50 +
          (dealerGammaBias === "short_gamma" ? 25 : 0),
      ),
    );

    const expiryPressureScore = Math.min(
      100,
      Math.round(
        Array.from(new Set(chain.map((r) => r.expiry))).length * 12 +
          options.oiConcentrationScore * 0.35,
      ),
    );

    const pinStrike = options.maxPainStrike > 0 ? options.maxPainStrike : null;
    const supportResistance = options.strikeLadder.slice(0, 4).map((s, i) => ({
      price: s.strike,
      strength: Math.round(100 - i * 18 - (Math.abs(s.strike - mid) / Math.max(mid, 1)) * 30),
    }));

    return {
      netGammaExposure: netGamma,
      dealerGammaBias,
      squeezeRiskScore,
      expiryPressureScore,
      pinStrike,
      supportResistance,
    };
  }
}
