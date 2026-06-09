import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { useTerminalStore } from "@/store/terminalStore";
import type { PerpFundingAnalytics } from "@/types/derivatives-intelligence";

export class PerpFundingAnalyticsEngine {
  static metrics(asset: string): PerpFundingAnalytics {
    const quotes = multiExchangeMarketState.forAsset(asset);
    const hl = quotes.find((q) => q.exchange === "hyperliquid");
    const deribit = quotes.find((q) => q.exchange === "deribit");
    const binance = quotes.find((q) => q.exchange === "binance");

    const hlFundingBps = (hl?.fundingRate ?? deribit?.fundingRate ?? 0.0001) * 10_000;
    const rates = quotes
      .map((q) => q.fundingRate)
      .filter((r): r is number => r != null);
    const avgFunding =
      rates.length > 0 ? (rates.reduce((s, r) => s + r, 0) / rates.length) * 10_000 : hlFundingBps;
    const crossVenueFundingBps = Math.round(avgFunding * 10) / 10;
    const fundingDivergenceBps = Math.round(
      Math.max(...rates.map((r) => r * 10_000), hlFundingBps) -
        Math.min(...rates.map((r) => r * 10_000), hlFundingBps),
    );

    const oiValues = quotes
      .map((q) => q.openInterestUsd)
      .filter((v): v is number => v != null && v > 0);
    const oiGrowthPct = oiValues.length >= 2
      ? Math.round(((oiValues[0]! - oiValues[oiValues.length - 1]!) / oiValues[oiValues.length - 1]!) * 100)
      : 8;

    const positions = useTerminalStore.getState().positions;
    const longN = positions.filter((p) => p.size > 0).length;
    const shortN = positions.filter((p) => p.size < 0).length;
    const crowdingBias: PerpFundingAnalytics["crowdingBias"] =
      hlFundingBps > 3 && longN > shortN
        ? "long"
        : hlFundingBps < -3 && shortN > longN
          ? "short"
          : "neutral";

    const leverageConcentration = Math.min(
      100,
      Math.round(positions.reduce((s, p) => s + p.leverage, 0) / Math.max(positions.length, 1) * 12),
    );

    const liquidationPressureScore = Math.min(
      100,
      Math.round(
        Math.abs(hlFundingBps) * 2 +
          fundingDivergenceBps * 0.5 +
          leverageConcentration * 0.35 +
          (binance?.openInterestUsd ? 12 : 0),
      ),
    );

    return {
      hlFundingBps: Math.round(hlFundingBps * 10) / 10,
      crossVenueFundingBps,
      fundingDivergenceBps,
      oiGrowthPct,
      leverageConcentration,
      crowdingBias,
      liquidationPressureScore,
    };
  }
}
