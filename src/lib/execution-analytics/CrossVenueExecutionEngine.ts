import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { useTerminalStore } from "@/store/terminalStore";
import type { CrossVenueExecutionRow } from "@/types/execution-analytics";
import type { ExchangeId } from "@/types/multi-exchange";

const VENUES: ExchangeId[] = [
  "hyperliquid",
  "binance",
  "bybit",
  "okx",
  "coinbase",
];

export class CrossVenueExecutionEngine {
  static context(asset: string): CrossVenueExecutionRow[] {
    const quotes = multiExchangeMarketState.forAsset(asset);
    const hlMid =
      useTerminalStore.getState().book?.mid ??
      quotes.find((q) => q.exchange === "hyperliquid")?.mid ??
      null;

    const totalLiq = quotes.reduce(
      (s, q) => s + (q.openInterestUsd ?? q.volume24hUsd ?? 0),
      0,
    );

    return VENUES.map((exchange) => {
      const q = quotes.find((x) => x.exchange === exchange);
      const mid = q?.mid ?? (exchange === "hyperliquid" ? hlMid : null);
      const divergenceBps =
        hlMid != null && mid != null && hlMid > 0
          ? (Math.abs(mid - hlMid) / hlMid) * 10_000
          : null;
      const liq = q?.openInterestUsd ?? q?.volume24hUsd ?? 0;

      return {
        exchange,
        mid,
        spreadBps: q?.spreadBps ?? null,
        divergenceBps: divergenceBps != null ? Math.round(divergenceBps * 10) / 10 : null,
        liquiditySharePct:
          totalLiq > 0 ? Math.round((liq / totalLiq) * 100) : exchange === "hyperliquid" ? 100 : 0,
      };
    });
  }
}
