import type { HlPerpMeta, HlSpotMeta } from "@/types/hyperliquid";
import type { TerminalAsset } from "@/types/terminal-schema";
import { enrichAssetsWithIndex } from "@/lib/asset-index";
import { fetchPerpMeta, fetchSpotMeta } from "@/lib/hyperliquid-api";

export const FALLBACK_ASSETS: TerminalAsset[] = [
  { id: "perp-BTC", symbol: "BTC", label: "BTC Perp", market: "perp", coin: "BTC" },
  { id: "perp-ETH", symbol: "ETH", label: "ETH Perp", market: "perp", coin: "ETH" },
  { id: "perp-SOL", symbol: "SOL", label: "SOL Perp", market: "perp", coin: "SOL" },
  { id: "perp-HYPE", symbol: "HYPE", label: "HYPE Perp", market: "perp", coin: "HYPE" },
  { id: "perp-PURR", symbol: "PURR", label: "PURR Perp", market: "perp", coin: "PURR" },
  { id: "spot-PURR", symbol: "PURR/USDC", label: "PURR Spot", market: "spot", coin: "PURR/USDC" },
];

function perpAssetsFromMeta(meta: HlPerpMeta): TerminalAsset[] {
  return meta.universe.map((u, index) => ({
    id: `perp-${u.name}`,
    symbol: u.name,
    label: `${u.name} Perp`,
    market: "perp" as const,
    coin: u.name,
    assetIndex: index,
    szDecimals: u.szDecimals,
  }));
}

function spotAssetsFromMeta(meta: HlSpotMeta): TerminalAsset[] {
  return meta.universe.map((pair) => {
    const baseToken = meta.tokens[pair.tokens[0]];
    return {
      id: `spot-${pair.index}`,
      symbol: pair.name,
      label: `${pair.name} Spot`,
      market: "spot" as const,
      coin: pair.name,
      assetIndex: 10_000 + pair.index,
      szDecimals: baseToken?.szDecimals ?? 4,
    };
  });
}

export async function loadHyperliquidAssets(): Promise<TerminalAsset[]> {
  try {
    const [perpMeta, spotMeta] = await Promise.all([
      fetchPerpMeta(),
      fetchSpotMeta(),
    ]);
    const perps = perpAssetsFromMeta(perpMeta);
    const spots = spotAssetsFromMeta(spotMeta);
    const merged = enrichAssetsWithIndex([...perps, ...spots], perpMeta, spotMeta);
    const seen = new Set<string>();
    return merged.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  } catch {
    return FALLBACK_ASSETS;
  }
}

export function filterAssets(assets: TerminalAsset[], query: string): TerminalAsset[] {
  const q = query.trim().toLowerCase();
  if (!q) return assets.slice(0, 50);
  return assets
    .filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.label.toLowerCase().includes(q) ||
        a.coin.toLowerCase().includes(q),
    )
    .slice(0, 50);
}
