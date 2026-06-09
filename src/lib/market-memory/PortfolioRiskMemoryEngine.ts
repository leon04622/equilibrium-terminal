import { PortfolioHistoryEngine } from "@/lib/portfolio-desk/PortfolioHistoryEngine";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import { KnowledgeMemoryEngine } from "@/lib/systemic-intelligence/KnowledgeMemoryEngine";
import type { PortfolioRiskMemoryPoint } from "@/types/market-memory";

export class PortfolioRiskMemoryEngine {
  static points(asset: string): PortfolioRiskMemoryPoint[] {
    try {
      const snap = PortfolioDeskOrchestrator.snapshot(asset);
      const systemic = KnowledgeMemoryEngine.points();
      const fromHistory: PortfolioRiskMemoryPoint[] = PortfolioHistoryEngine.points().map((p) => ({
        timestamp: p.timestamp,
        leverageRatio: p.leverageRatio,
        drawdownPct: Math.max(0, 100 - p.riskScore) * 0.1,
        collateralHealth: 100 - p.riskScore,
      }));
      const fromSystemic: PortfolioRiskMemoryPoint[] = systemic.map((p) => ({
        timestamp: p.timestamp,
        leverageRatio: 1,
        drawdownPct: Math.max(0, p.contagionRisk * 0.1),
        collateralHealth: 100 - p.contagionRisk,
      }));

      const current: PortfolioRiskMemoryPoint = {
        timestamp: Date.now(),
        leverageRatio: snap.risk.leverageRatio,
        drawdownPct: snap.analytics.maxDrawdownPct,
        collateralHealth: snap.risk.collateralHealthScore,
      };

      return [current, ...fromHistory, ...fromSystemic].slice(0, 24);
    } catch {
      return [];
    }
  }
}
