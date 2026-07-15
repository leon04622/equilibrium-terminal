import type { NormalizedSpotBalance } from "@/types/terminal-schema";

export const SPOT_ASSET_OFFSET = 10_000;

export function isSpotAssetIndex(assetIndex: number): boolean {
  return assetIndex >= SPOT_ASSET_OFFSET;
}

/** Base token from a spot pair name — e.g. PURR/USDC → PURR. */
export function spotBaseSymbol(pairCoin: string): string {
  const slash = pairCoin.indexOf("/");
  return slash > 0 ? pairCoin.slice(0, slash) : pairCoin;
}

export function lookupSpotBalance(
  balances: NormalizedSpotBalance[],
  pairCoin: string,
): NormalizedSpotBalance | null {
  const base = spotBaseSymbol(pairCoin);
  return balances.find((b) => b.coin === base) ?? null;
}

export function lookupUsdcSpotBalance(
  balances: NormalizedSpotBalance[],
): NormalizedSpotBalance | null {
  return balances.find((b) => b.coin === "USDC") ?? null;
}

export function maxSpotBuySize(
  balances: NormalizedSpotBalance[],
  pairCoin: string,
  markPx: number,
  perpWithdrawable: number | null,
): number {
  if (!markPx || markPx <= 0) return 0;
  const usdc = lookupUsdcSpotBalance(balances);
  const spotUsdc = usdc?.available ?? 0;
  const withdraw = perpWithdrawable ?? 0;
  const spendable = Math.max(spotUsdc, withdraw);
  return spendable / markPx;
}

export function maxSpotSellSize(
  balances: NormalizedSpotBalance[],
  pairCoin: string,
): number {
  const holding = lookupSpotBalance(balances, pairCoin);
  return holding?.available ?? 0;
}
