import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type { LiquidityFlowRow } from "@/types/systemic-intelligence";

export class LiquidityFlowMappingEngine {
  static flows(asset: string): LiquidityFlowRow[] {
    const portfolio = PortfolioDeskOrchestrator.snapshot(asset);
    const flowLinks = marketKnowledgeGraph
      .getAllLinks()
      .filter((l) => l.relation === "flows_to")
      .slice(0, 12);

    const fromGraph: LiquidityFlowRow[] = flowLinks.map((l, i) => ({
      id: `flow-${i}`,
      from: l.from.replace(/^[^:]+:/, ""),
      to: l.to.replace(/^[^:]+:/, ""),
      flowType:
        l.from.includes("stablecoin")
          ? "stablecoin"
          : l.from.includes("treasury")
            ? "treasury"
            : l.from.includes("bridge")
              ? "bridge"
              : "exchange",
      magnitudeUsd: Math.round(500_000 + l.weight * 200_000),
      velocity: portfolio.treasury.flowVelocity,
    }));

    const seeded: LiquidityFlowRow[] = [
      {
        id: "flow-hl-in",
        from: "BINANCE",
        to: "HYPERLIQUID",
        flowType: "exchange",
        magnitudeUsd: portfolio.treasury.operationalLiquidityUsd * 0.2,
        velocity: portfolio.treasury.flowVelocity,
      },
      {
        id: "flow-stable",
        from: "USDC",
        to: asset.toUpperCase(),
        flowType: "stablecoin",
        magnitudeUsd: portfolio.treasury.stablecoinBalanceUsd * 0.15,
        velocity: "stable",
      },
      {
        id: "flow-bridge",
        from: "ETHEREUM",
        to: "ARBITRUM",
        flowType: "bridge",
        magnitudeUsd: portfolio.treasury.bridgeExposureUsd,
        velocity: portfolio.treasury.flowVelocity === "stressed" ? "stressed" : "active",
      },
    ];

    return [...fromGraph, ...seeded].slice(0, 14);
  }
}
