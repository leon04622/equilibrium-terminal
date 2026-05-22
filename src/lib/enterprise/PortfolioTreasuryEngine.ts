import { useTerminalStore } from "@/store/terminalStore";
import type { PortfolioExposureRow, TreasurySummary } from "@/types/enterprise-operations";

export class PortfolioTreasuryEngine {
  static exposures(): PortfolioExposureRow[] {
    const positions = useTerminalStore.getState().positions;
    const selected = useTerminalStore.getState().selectedAsset?.coin ?? "BTC";

    const fromPositions: PortfolioExposureRow[] = positions.slice(0, 6).map((p, i) => ({
      asset: p.coin,
      category: "perp" as const,
      notionalUsd: Math.abs(p.size * p.entryPrice),
      pctPortfolio: Math.min(40, 12 + i * 4),
      exchange: "Hyperliquid",
      leverage: p.leverage ?? 1,
      deltaUsd: p.unrealizedPnl,
      riskBand: Math.abs(p.unrealizedPnl) > 5000 ? "elevated" as const : "moderate" as const,
    }));

    const seeded: PortfolioExposureRow[] = [
      {
        asset: "USDT",
        category: "stablecoin",
        notionalUsd: 2_400_000,
        pctPortfolio: 24,
        exchange: "Multi",
        leverage: 1,
        deltaUsd: 0,
        riskBand: "low",
      },
      {
        asset: "USDC",
        category: "stablecoin",
        notionalUsd: 1_800_000,
        pctPortfolio: 18,
        exchange: "Multi",
        leverage: 1,
        deltaUsd: 0,
        riskBand: "low",
      },
      {
        asset: selected,
        category: "perp",
        notionalUsd: 890_000,
        pctPortfolio: 8.9,
        exchange: "Hyperliquid",
        leverage: 3.2,
        deltaUsd: 12_400,
        riskBand: "moderate",
      },
    ];

    const merged = new Map<string, PortfolioExposureRow>();
    for (const row of [...fromPositions, ...seeded]) {
      merged.set(row.asset, row);
    }
    return Array.from(merged.values()).sort((a, b) => b.pctPortfolio - a.pctPortfolio);
  }

  static treasury(): TreasurySummary {
    const exposures = PortfolioTreasuryEngine.exposures();
    const total = exposures.reduce((s, e) => s + e.notionalUsd, 0) || 10_000_000;
    const stable = exposures
      .filter((e) => e.category === "stablecoin")
      .reduce((s, e) => s + e.notionalUsd, 0);

    return {
      totalAumUsd: total,
      stablecoinPct: Math.round((stable / total) * 100),
      crossExchangeBalanceUsd: stable * 0.72,
      liquidityBufferPct: 18,
      leverageRatio: 1.42,
      netDeltaUsd: exposures.reduce((s, e) => s + e.deltaUsd, 0),
      updatedAt: Date.now(),
    };
  }
}
