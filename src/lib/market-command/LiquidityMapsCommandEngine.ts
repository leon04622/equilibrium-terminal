import { LiquidityFlowMappingEngine } from "@/lib/systemic-intelligence/LiquidityFlowMappingEngine";
import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import type { LiquidityMapRow } from "@/types/market-command";

export class LiquidityMapsCommandEngine {
  static maps(asset: string): LiquidityMapRow[] {
    const flows = LiquidityFlowMappingEngine.flows(asset);
    const liq = ExecutionAnalyticsOrchestrator.snapshot(asset).liquidity;

    const fromFlows = flows.slice(0, 6).map((f) => ({
      id: f.id,
      route: `${f.from} → ${f.to}`,
      magnitude: `$${(f.magnitudeUsd / 1_000_000).toFixed(1)}M`,
      velocity: f.velocity,
    }));

    fromFlows.push({
      id: "liq-depth",
      route: "HL book depth",
      magnitude: `$${((liq.restingBidUsd + liq.restingAskUsd) / 1_000_000).toFixed(1)}M`,
      velocity: liq.depthCollapseRisk > 50 ? "stressed" : "active",
    });

    return fromFlows;
  }
}
