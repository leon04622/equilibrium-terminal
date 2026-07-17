import {
  fetchAllPerpMetas,
  fetchMetaAndAssetCtxs,
  fetchPerpDexs,
  fetchPerpMeta,
  fetchSpotMetaAndAssetCtxs,
} from "@/lib/hyperliquid/api";
import { perpDisplayPair, perpDisplaySymbol, spotDisplayPair } from "@/lib/hyperliquid/coin";
import type { HlPerpAssetCtx, HlPerpMeta, HlSpotAssetCtx, HlSpotMeta } from "@/types/hyperliquid";
import type { TerminalAsset } from "@/types/terminal-schema";

export interface HlUniverseBundle {
  assets: TerminalAsset[];
  perpCtxByCoin: Map<string, HlPerpAssetCtx>;
  spotCtxByCoin: Map<string, HlSpotAssetCtx>;
  leverageByCoin: Map<string, number>;
}

function dexId(entry: { name: string } | null, index: number): string {
  if (index === 0 || entry == null) return "main";
  return entry.name;
}

function perpAssetsFromDexMeta(meta: HlPerpMeta, dex: string, isHip3: boolean): TerminalAsset[] {
  return meta.universe.map((u, index) => ({
    id: `${dex}-perp-${u.name}`,
    symbol: perpDisplaySymbol(u.name),
    label: `${perpDisplayPair(u.name)} Perp`,
    market: "perp" as const,
    coin: u.name,
    assetIndex: index,
    szDecimals: u.szDecimals,
    dex,
    isHip3,
  }));
}

function spotAssetsFromMeta(meta: HlSpotMeta): TerminalAsset[] {
  return meta.universe.map((pair) => {
    const baseToken = meta.tokens[pair.tokens[0]];
    const display = spotDisplayPair(pair.name, pair.tokens, meta.tokens);
    return {
      id: `spot-${pair.index}`,
      symbol: display,
      label: `${display} Spot`,
      market: "spot" as const,
      coin: pair.name,
      assetIndex: 10_000 + pair.index,
      szDecimals: baseToken?.szDecimals ?? 4,
      dex: "spot",
      isHip3: false,
    };
  });
}

export async function loadHyperliquidUniverse(): Promise<HlUniverseBundle> {
  const [perpDexs, allPerpMetas, spotBundle] = await Promise.all([
    fetchPerpDexs(),
    fetchAllPerpMetas(),
    fetchSpotMetaAndAssetCtxs(),
  ]);

  const perpCtxBundles = await Promise.all(
    perpDexs.map((entry, index) => {
      const dex = index === 0 ? undefined : entry?.name;
      return fetchMetaAndAssetCtxs(dex);
    }),
  );

  const assets: TerminalAsset[] = [];
  const perpCtxByCoin = new Map<string, HlPerpAssetCtx>();
  const leverageByCoin = new Map<string, number>();

  allPerpMetas.forEach((meta, index) => {
    const dex = dexId(perpDexs[index] ?? null, index);
    const isHip3 = index > 0;
    assets.push(...perpAssetsFromDexMeta(meta, dex, isHip3));

    const universe = perpCtxBundles[index]?.[0]?.universe ?? meta.universe;
    const ctxs = perpCtxBundles[index]?.[1] ?? [];
    universe.forEach((u, i) => {
      if (u.maxLeverage != null) leverageByCoin.set(u.name, u.maxLeverage);
      const ctx = ctxs[i];
      if (ctx) perpCtxByCoin.set(u.name, ctx);
    });
  });

  const [spotMeta, spotCtxs] = spotBundle;
  assets.push(...spotAssetsFromMeta(spotMeta));

  const spotCtxByCoin = new Map<string, HlSpotAssetCtx>();
  for (const ctx of spotCtxs) {
    if (ctx.coin) spotCtxByCoin.set(ctx.coin, ctx);
  }

  const seen = new Set<string>();
  const deduped = assets.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return { assets: deduped, perpCtxByCoin, spotCtxByCoin, leverageByCoin };
}

/** Fast main perp + spot list — used when full universe fetch fails on client. */
export async function loadLightweightHyperliquidAssets(): Promise<TerminalAsset[]> {
  const [perpMeta, spotBundle] = await Promise.all([
    fetchPerpMeta(),
    fetchSpotMetaAndAssetCtxs(),
  ]);
  const [spotMeta] = spotBundle;
  return [
    ...perpAssetsFromDexMeta(perpMeta, "main", false),
    ...spotAssetsFromMeta(spotMeta),
  ];
}

export async function loadHyperliquidAssets(): Promise<TerminalAsset[]> {
  try {
    const { assets } = await loadHyperliquidUniverse();
    if (assets.length > 0) return assets;
  } catch (e) {
    console.warn("[hlUniverse] full universe failed, falling back to main perp+spot", e);
  }
  try {
    return await loadLightweightHyperliquidAssets();
  } catch (e) {
    console.warn("[hlUniverse] lightweight asset load failed", e);
    return [];
  }
}
