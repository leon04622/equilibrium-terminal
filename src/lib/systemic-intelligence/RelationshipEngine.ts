import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import type { RelationshipEdge, RelationshipMetrics } from "@/types/systemic-intelligence";

export class RelationshipEngine {
  static edges(asset: string, limit = 24): RelationshipEdge[] {
    const center = `asset:${asset.toUpperCase()}`;
    const { links } = marketKnowledgeGraph.getNeighbors(center, 2);
    return links.slice(0, limit).map((l) => ({
      from: l.from,
      to: l.to,
      relation: l.relation,
      strength: l.weight,
      label: l.evidence,
    }));
  }

  static metrics(asset: string): RelationshipMetrics {
    const portfolio = PortfolioDeskOrchestrator.snapshot(asset);
    const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
    const links = marketKnowledgeGraph.getAllLinks();
    const assetLinks = links.filter(
      (l) => l.from.includes(asset) || l.to.includes(asset),
    );

    const exchangeDependencyPct = Math.min(
      100,
      portfolio.portfolio.holdings
        .filter((h) => h.venue === "Hyperliquid")
        .reduce((s, h) => s + h.pctPortfolio, 0),
    );

    const stablecoinLinkage = portfolio.risk.stablecoinDependencyPct;
    const derivativesInfluence = Math.min(100, deriv.gamma.squeezeRiskScore + deriv.funding.oiGrowthPct);
    const macroSensitivity = Math.min(
      100,
      marketKnowledgeGraph.findByKind("macro_event").length * 8 +
        deriv.marketState.fragilityScore * 0.4,
    );
    const sectorRotationScore = Math.min(
      100,
      marketKnowledgeGraph.findByKind("sector").length * 10 + assetLinks.length,
    );
    const correlationStress = Math.round(
      portfolio.risk.correlationStress * 0.5 + deriv.volatility.volSpread * 2,
    );

    return {
      correlationStress: Math.min(100, correlationStress),
      exchangeDependencyPct,
      stablecoinLinkage,
      derivativesInfluence,
      macroSensitivity,
      sectorRotationScore,
    };
  }
}
