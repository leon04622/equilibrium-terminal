import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketHealthIndicator } from "@/types/market-coverage";

function ind(
  id: string,
  label: string,
  score: number,
  detail: string,
): MarketHealthIndicator {
  const state: MarketHealthIndicator["state"] =
    score >= 75
      ? "healthy"
      : score >= 50
        ? "elevated"
        : score >= 30
          ? "stressed"
          : "critical";
  return { id, label, state, score, detail };
}

export class MarketHealthEngine {
  static assess(): MarketHealthIndicator[] {
    const stress = useMarketAtmosphereStore.getState().stress;
    const regime = useMarketAtmosphereStore.getState().regime;
    const surv = useInformationDiscoveryStore.getState().surveillance;
    const book = useTerminalStore.getState().book;
    const mids = useTerminalStore.getState().mids.mids;

    const spread = book?.spreadBps ?? 10;
    const liqHealth = Math.max(0, Math.min(100, 100 - spread * 3));
    const exchStress = Math.max(0, 100 - stress.score);
    const stableConf = regime.regime === "liquidation" ? 35 : 68;
    const leverageSat = Math.min(100, (surv?.stressScore ?? 40) + stress.velocityRatio * 20);
    const volCompression =
      stress.velocityRatio < 0.85 ? 80 : stress.velocityRatio > 1.4 ? 25 : 55;
    const movers = surv?.movers ?? [];
    const breadth = movers.length
      ? Math.round((movers.filter((m) => m.changePct > 0).length / movers.length) * 100)
      : 50;
    const systemic =
      regime.regime === "liquidation"
        ? 22
        : regime.regime === "risk-off"
          ? 38
          : stress.score > 70
            ? 35
            : 62;

    return [
      ind("liq", "LIQUIDITY HEALTH", liqHealth, `Spread ${spread.toFixed(1)} bps on active book`),
      ind("exch", "EXCHANGE STRESS", exchStress, `Composite stress ${stress.score.toFixed(0)}`),
      ind("stable", "STABLECOIN CONFIDENCE", stableConf, "Issuer & peg stability proxy"),
      ind("lev", "LEVERAGE SATURATION", 100 - leverageSat, "Funding/OI stress blend"),
      ind("volc", "VOL COMPRESSION", volCompression, `Velocity ${stress.velocityRatio.toFixed(2)}×`),
      ind("breadth", "MARKET BREADTH", breadth, `${Object.keys(mids).length} mids tracked`),
      ind("sys", "SYSTEMIC RISK", systemic, `Regime ${regime.regime}`),
    ];
  }
}
