import { fetchPerpMeta, fetchSpotMeta } from "@/lib/hyperliquid/api";
import type { HlPerpMeta, HlSpotMeta } from "@/types/hyperliquid";
import type { InstrumentMasterRecord, InstrumentMasterSnapshot } from "@/types/institutional-capabilities";

function perpRecords(meta: HlPerpMeta): InstrumentMasterRecord[] {
  const now = Date.now();
  return meta.universe.map((u, index) => ({
    id: `perp-${u.name}`,
    symbol: u.name,
    coin: u.name,
    market: "perp",
    assetIndex: index,
    szDecimals: u.szDecimals,
    maxLeverage: u.maxLeverage,
    onlyIsolated: Boolean(u.onlyIsolated),
    isDelisted: false,
    venue: "hyperliquid",
    assetClass: "crypto_perp",
    tickSize: Math.pow(10, -(u.szDecimals ?? 4)),
    updatedAt: now,
  }));
}

function spotRecords(meta: HlSpotMeta): InstrumentMasterRecord[] {
  const now = Date.now();
  return meta.universe.map((pair) => {
    const base = meta.tokens[pair.tokens[0]];
    return {
      id: `spot-${pair.index}`,
      symbol: pair.name,
      coin: pair.name,
      market: "spot",
      assetIndex: 10_000 + pair.index,
      szDecimals: base?.szDecimals ?? 4,
      maxLeverage: 1,
      onlyIsolated: false,
      isDelisted: false,
      venue: "hyperliquid",
      assetClass: "crypto_spot",
      tickSize: Math.pow(10, -(base?.szDecimals ?? 4)),
      updatedAt: now,
    };
  });
}

export class InstrumentMasterEngine {
  private static cache: InstrumentMasterSnapshot | null = null;
  private static cacheAt = 0;
  private static readonly TTL_MS = 5 * 60_000;

  static async snapshot(force = false): Promise<InstrumentMasterSnapshot> {
    if (
      !force &&
      this.cache &&
      Date.now() - this.cacheAt < this.TTL_MS
    ) {
      return this.cache;
    }

    const [perpMeta, spotMeta] = await Promise.all([fetchPerpMeta(), fetchSpotMeta()]);
    const perps = perpRecords(perpMeta);
    const spots = spotRecords(spotMeta);
    const instruments = [...perps, ...spots].sort((a, b) =>
      a.symbol.localeCompare(b.symbol),
    );

    this.cache = {
      instruments,
      perpCount: perps.length,
      spotCount: spots.length,
      updatedAt: Date.now(),
    };
    this.cacheAt = Date.now();
    return this.cache;
  }

  static lookup(coin: string, snapshot: InstrumentMasterSnapshot): InstrumentMasterRecord | null {
    const upper = coin.toUpperCase();
    return (
      snapshot.instruments.find(
        (i) => i.coin.toUpperCase() === upper || i.symbol.toUpperCase() === upper,
      ) ?? null
    );
  }
}
