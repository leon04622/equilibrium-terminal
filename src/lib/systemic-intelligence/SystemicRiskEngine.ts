import { RelationshipEngine } from "@/lib/systemic-intelligence/RelationshipEngine";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type { SystemicRiskMetrics } from "@/types/systemic-intelligence";

export class SystemicRiskEngine {
  static metrics(asset: string): SystemicRiskMetrics {
    const rel = RelationshipEngine.metrics(asset);
    const portfolio = PortfolioDeskOrchestrator.snapshot(asset);
    const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);

    const exchangeConcentration = rel.exchangeDependencyPct;
    const stablecoinDependency = rel.stablecoinLinkage;
    const liquidityFragmentation = Math.min(
      100,
      100 - deriv.crossMarket.crossVenueFragmentation + portfolio.collateral.utilizationPct * 0.3,
    );
    const leverageStress = portfolio.risk.liquidationRiskScore;
    const contagionRisk = Math.min(
      100,
      Math.round(
        exchangeConcentration * 0.25 +
          stablecoinDependency * 0.2 +
          leverageStress * 0.25 +
          deriv.marketState.fragilityScore * 0.2 +
          rel.correlationStress * 0.1,
      ),
    );
    const volPropagation =
      deriv.volatility.regime === "stress"
        ? 85
        : deriv.volatility.regime === "expansion"
          ? 65
          : deriv.volatility.regime === "compression"
            ? 25
            : 40;
    const treasuryConcentration = Math.min(
      100,
      marketKnowledgeGraph.findByKind("treasury").length * 15 + portfolio.treasury.stablecoinPct * 0.5,
    );

    let riskTier: SystemicRiskMetrics["riskTier"] = "low";
    if (contagionRisk >= 75) riskTier = "critical";
    else if (contagionRisk >= 55) riskTier = "elevated";
    else if (contagionRisk >= 35) riskTier = "moderate";

    return {
      exchangeConcentration,
      stablecoinDependency,
      liquidityFragmentation,
      leverageStress,
      contagionRisk,
      volPropagation,
      treasuryConcentration,
      riskTier,
    };
  }
}
