import { PortfolioTreasuryEngine } from "@/lib/enterprise/PortfolioTreasuryEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { PortfolioExposureRow, TreasuryPosition } from "@/types/crypto-ecosystem";

export class PortfolioOperatingEngine {
  static exposures(): PortfolioExposureRow[] {
    const enterprise = PortfolioTreasuryEngine.exposures();
    const positions = useTerminalStore.getState().positions;

    const fromPositions: PortfolioExposureRow[] = positions.map((p) => ({
      asset: p.coin,
      notionalUsd: Math.abs(p.size * p.entryPrice),
      pctPortfolio: 0,
      venue: "Hyperliquid",
      pnlUsd: p.unrealizedPnl,
      collateralUsd: Math.abs(p.size * p.markPrice) / Math.max(p.leverage, 1),
      leverage: p.leverage,
      riskBand:
        Math.abs(p.unrealizedPnl) > 8000
          ? "critical"
          : Math.abs(p.unrealizedPnl) > 3000
            ? "elevated"
            : "moderate",
    }));

    const fromEnterprise: PortfolioExposureRow[] = enterprise.map((e) => ({
      asset: e.asset,
      notionalUsd: e.notionalUsd,
      pctPortfolio: e.pctPortfolio,
      venue: e.exchange,
      pnlUsd: e.deltaUsd,
      collateralUsd: e.notionalUsd / Math.max(e.leverage, 1),
      leverage: e.leverage,
      riskBand: e.riskBand,
    }));

    const merged = new Map<string, PortfolioExposureRow>();
    for (const row of [...fromPositions, ...fromEnterprise]) {
      merged.set(row.asset, row);
    }
    return Array.from(merged.values()).sort((a, b) => b.notionalUsd - a.notionalUsd);
  }

  static treasury(): TreasuryPosition[] {
    const summary = PortfolioTreasuryEngine.treasury();
    return [
      {
        asset: "USDT",
        balanceUsd: summary.totalAumUsd * (summary.stablecoinPct / 100) * 0.55,
        venue: "Multi",
        stablecoinPct: summary.stablecoinPct,
        utilizationPct: 42,
      },
      {
        asset: "USDC",
        balanceUsd: summary.totalAumUsd * (summary.stablecoinPct / 100) * 0.45,
        venue: "Multi",
        stablecoinPct: summary.stablecoinPct,
        utilizationPct: 38,
      },
      {
        asset: "HL Collateral",
        balanceUsd: summary.crossExchangeBalanceUsd,
        venue: "Hyperliquid",
        stablecoinPct: 0,
        utilizationPct: Math.round(summary.leverageRatio * 30),
      },
    ];
  }

  static summary(): { totalAumUsd: number; netPnlUsd: number } {
    const t = PortfolioTreasuryEngine.treasury();
    const exposures = PortfolioOperatingEngine.exposures();
    return {
      totalAumUsd: t.totalAumUsd,
      netPnlUsd: exposures.reduce((s, e) => s + e.pnlUsd, 0) + t.netDeltaUsd,
    };
  }
}
