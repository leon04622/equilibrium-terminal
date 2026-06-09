import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import type { SystemicRiskRow } from "@/types/market-command";

export class SystemicRiskCommandEngine {
  static factors(asset: string): SystemicRiskRow[] {
    const r = SystemicRiskEngine.metrics(asset);
    return [
      { id: "sr-exch", factor: "Exchange concentration", score: r.exchangeConcentration, tier: r.riskTier },
      { id: "sr-stable", factor: "Stablecoin dependency", score: r.stablecoinDependency, tier: r.riskTier },
      { id: "sr-liq", factor: "Liquidity fragmentation", score: r.liquidityFragmentation, tier: r.riskTier },
      { id: "sr-lev", factor: "Leverage stress", score: r.leverageStress, tier: r.riskTier },
      { id: "sr-cont", factor: "Contagion risk", score: r.contagionRisk, tier: r.riskTier },
      { id: "sr-vol", factor: "Vol propagation", score: r.volPropagation, tier: r.riskTier },
    ];
  }
}
