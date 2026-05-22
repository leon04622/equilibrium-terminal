import type { HlPerpMeta, HlSpotMeta } from "@/types/hyperliquid";
import type { TerminalAsset } from "@/types/terminal-schema";
import { fetchPerpMeta, fetchSpotMeta } from "@/lib/hyperliquid/api";

let perpMetaCache: HlPerpMeta | null = null;
let spotMetaCache: HlSpotMeta | null = null;
let coinToAsset = new Map<string, number>();
let assetToSzDecimals = new Map<number, number>();

export async function ensureAssetIndexMaps(): Promise<void> {
  if (perpMetaCache && spotMetaCache) return;
  const [perpMeta, spotMeta] = await Promise.all([fetchPerpMeta(), fetchSpotMeta()]);
  perpMetaCache = perpMeta;
  spotMetaCache = spotMeta;
  coinToAsset = new Map();
  assetToSzDecimals = new Map();
  perpMeta.universe.forEach((u, index) => {
    coinToAsset.set(u.name, index);
    assetToSzDecimals.set(index, u.szDecimals);
  });
  spotMeta.universe.forEach((pair) => {
    const asset = 10_000 + pair.index;
    coinToAsset.set(pair.name, asset);
    const baseToken = spotMeta.tokens[pair.tokens[0]];
    if (baseToken) assetToSzDecimals.set(asset, baseToken.szDecimals);
  });
}

export async function resolveAssetIndex(coin: string): Promise<number> {
  await ensureAssetIndexMaps();
  const idx = coinToAsset.get(coin);
  if (idx === undefined) throw new Error(`Unknown asset: ${coin}`);
  return idx;
}

export async function getSzDecimals(assetIndex: number): Promise<number> {
  await ensureAssetIndexMaps();
  return assetToSzDecimals.get(assetIndex) ?? 4;
}

export function enrichAssetsWithIndex(
  assets: TerminalAsset[],
  perpMeta: HlPerpMeta,
  spotMeta: HlSpotMeta,
): TerminalAsset[] {
  return assets.map((a) => {
    if (a.market === "perp") {
      const idx = perpMeta.universe.findIndex((u) => u.name === a.coin);
      return { ...a, assetIndex: idx >= 0 ? idx : undefined };
    }
    const pair = spotMeta.universe.find((u) => u.name === a.coin);
    return { ...a, assetIndex: pair ? 10_000 + pair.index : undefined };
  });
}
