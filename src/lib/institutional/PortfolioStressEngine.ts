import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { useTerminalStore } from "@/store/terminalStore";
import {
  STRESS_SCENARIOS,
  type PortfolioStressSnapshot,
  type StressScenarioId,
  type StressScenarioResult,
} from "@/types/institutional-capabilities";

const SHOCK: Record<StressScenarioId, { markMult: number; marginBump: number; fundingUsd: number }> = {
  btc_crash_20: { markMult: 0.8, marginBump: 12, fundingUsd: 0 },
  eth_crash_15: { markMult: 0.85, marginBump: 10, fundingUsd: 0 },
  vol_spike: { markMult: 0.92, marginBump: 18, fundingUsd: 0 },
  funding_shock: { markMult: 0.99, marginBump: 4, fundingUsd: -25 },
  liquidity_gap: { markMult: 0.95, marginBump: 8, fundingUsd: 0 },
  correlation_1: { markMult: 0.88, marginBump: 14, fundingUsd: 0 },
};

export class PortfolioStressEngine {
  static snapshot(): PortfolioStressSnapshot {
    const state = useTerminalStore.getState();
    const risk = RiskEngine.metrics();
    const accountValue = Math.max(state.accountValue ?? 0, 1);

    const scenarios: StressScenarioResult[] = STRESS_SCENARIOS.map((scenario) => {
      const shock = SHOCK[scenario.id];
      let portfolioPnlUsd = shock.fundingUsd;
      let worstCoin: string | null = null;
      let worstCoinPnlUsd = 0;

      for (const pos of state.positions) {
        const notional = Math.abs(pos.size * pos.markPrice);
        const isBtc = pos.coin === "BTC";
        const isEth = pos.coin === "ETH";
        const coinShock =
          scenario.id === "btc_crash_20" && isBtc
            ? shock.markMult
            : scenario.id === "eth_crash_15" && isEth
              ? shock.markMult
              : scenario.id === "correlation_1"
                ? 0.9
                : shock.markMult;

        const pnlDelta =
          pos.size > 0
            ? notional * (coinShock - 1)
            : notional * (1 - coinShock);

        portfolioPnlUsd += pnlDelta;
        if (pnlDelta < worstCoinPnlUsd) {
          worstCoinPnlUsd = pnlDelta;
          worstCoin = pos.coin;
        }
      }

      const marginAfterPct = Math.min(
        100,
        risk.marginUtilizationPct + shock.marginBump,
      );
      const liquidationRiskAfter = Math.min(
        100,
        risk.liquidationRiskScore + Math.round(Math.abs(portfolioPnlUsd / accountValue) * 100 * 0.6),
      );

      return {
        scenario,
        portfolioPnlUsd: Math.round(portfolioPnlUsd * 100) / 100,
        portfolioPnlPct: Math.round((portfolioPnlUsd / accountValue) * 10000) / 100,
        marginAfterPct,
        liquidationRiskAfter,
        worstCoin,
        worstCoinPnlUsd: Math.round(worstCoinPnlUsd * 100) / 100,
      };
    });

    return {
      accountValueUsd: accountValue,
      baseMarginUtilPct: risk.marginUtilizationPct,
      scenarios,
      computedAt: Date.now(),
    };
  }
}
