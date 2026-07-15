import type { ExecuteOrderParams } from "@/types/exchange";
import { MARKET_SLIPPAGE } from "@/lib/hyperliquid/constants";
import { slippagePrice } from "@/lib/hyperliquid/signing";

/** Simulated fill at live book prices — no exchange submission. */
export function paperFillPrice(params: ExecuteOrderParams, markPx: number): number {
  if (params.mode === "limit" && params.limitPx && params.limitPx > 0) {
    return params.limitPx;
  }
  if (params.mode === "stop" && params.stopPx && params.stopPx > 0) {
    return params.stopPx;
  }
  const ref = params.markPx ?? markPx;
  const szDecimals = params.szDecimals ?? 4;
  const isSpot = params.asset >= 10_000;
  return slippagePrice(ref, params.isBuy, MARKET_SLIPPAGE, szDecimals, isSpot);
}
