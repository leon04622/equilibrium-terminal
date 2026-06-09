import { PortfolioTreasuryEngine } from "@/lib/enterprise/PortfolioTreasuryEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { TreasuryVisibility } from "@/types/portfolio-risk-treasury";

export class TreasuryVisibilityEngine {
  static snapshot(): TreasuryVisibility {
    const treasury = PortfolioTreasuryEngine.treasury();
    const withdrawable = useTerminalStore.getState().withdrawable ?? 0;
    const stablecoinBalanceUsd =
      treasury.totalAumUsd * (treasury.stablecoinPct / 100);

    const operationalLiquidityUsd = withdrawable + stablecoinBalanceUsd * 0.12;
    const bridgeExposureUsd = stablecoinBalanceUsd * 0.08;
    const custodyExposureScore = Math.min(
      100,
      Math.round(100 - treasury.liquidityBufferPct + treasury.leverageRatio * 8),
    );

    let flowVelocity: TreasuryVisibility["flowVelocity"] = "stable";
    if (treasury.leverageRatio > 1.8 || treasury.liquidityBufferPct < 12) flowVelocity = "stressed";
    else if (treasury.netDeltaUsd !== 0) flowVelocity = "active";

    return {
      stablecoinBalanceUsd,
      stablecoinPct: treasury.stablecoinPct,
      exchangeAllocationPct: Math.round(
        (treasury.crossExchangeBalanceUsd / Math.max(treasury.totalAumUsd, 1)) * 100,
      ),
      coldHotRatio: 0.28,
      operationalLiquidityUsd,
      bridgeExposureUsd,
      custodyExposureScore,
      flowVelocity,
    };
  }
}
