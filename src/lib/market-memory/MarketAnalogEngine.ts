import { OperationalMemoryEngine } from "@/lib/proprietary/OperationalMemoryEngine";
import { RegimeAnalysisEngine } from "@/lib/market-memory/RegimeAnalysisEngine";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import type { MarketAnalogMatch } from "@/types/market-memory";

export class MarketAnalogEngine {
  static matches(asset: string): MarketAnalogMatch[] {
    const regime = RegimeAnalysisEngine.classify(asset);
    const analogs: MarketAnalogMatch[] = [];

    for (const m of OperationalMemoryEngine.archive().slice(0, 4)) {
      analogs.push({
        id: m.id,
        label: m.title,
        analogDate: m.analogDate ?? "—",
        similarityPct: m.relevanceScore,
        category:
          m.kind === "vol_analog"
            ? "volatility"
            : m.kind === "liquidity_regime"
              ? "liquidity"
              : m.kind === "macro_reaction"
                ? "stablecoin"
                : "derivatives",
        summary: m.summary,
      });
    }

    try {
      const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
      if (deriv.volatility.volSpread > 8) {
        analogs.push({
          id: "analog-vol-local",
          label: "IV expansion analog",
          analogDate: "2024-08-05",
          similarityPct: Math.min(92, 60 + deriv.volatility.volSpread),
          category: "volatility",
          summary: `Current IV spread ${deriv.volatility.volSpread} vs RV ${deriv.volatility.realizedVol}`,
        });
      }
      if (Math.abs(deriv.funding.hlFundingBps) >= 8) {
        analogs.push({
          id: "analog-funding-local",
          label: "Funding stress analog",
          analogDate: "2025-01-22",
          similarityPct: Math.min(88, 55 + Math.abs(deriv.funding.hlFundingBps)),
          category: "funding",
          summary: `HL funding ${deriv.funding.hlFundingBps} bps`,
        });
      }
    } catch {
      /* partial */
    }

    try {
      const port = PortfolioDeskOrchestrator.snapshot(asset);
      if (port.risk.liquidationRiskScore >= 50) {
        analogs.push({
          id: "analog-lev-local",
          label: "Leverage cycle analog",
          analogDate: "2024-03-12",
          similarityPct: port.risk.liquidationRiskScore,
          category: "leverage",
          summary: `Liquidation risk ${port.risk.liquidationRiskScore} · ${regime.leverageCycle}`,
        });
      }
    } catch {
      /* partial */
    }

    return analogs.sort((a, b) => b.similarityPct - a.similarityPct).slice(0, 10);
  }
}
