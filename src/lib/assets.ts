import type { TerminalAsset } from "@/types/terminal-schema";
import { loadHyperliquidAssets as loadFullAssets } from "@/lib/market/hlUniverse";

export const FALLBACK_ASSETS: TerminalAsset[] = [
  { id: "perp-BTC", symbol: "BTC", label: "BTC Perp", market: "perp", coin: "BTC", dex: "main" },
  { id: "perp-ETH", symbol: "ETH", label: "ETH Perp", market: "perp", coin: "ETH", dex: "main" },
  { id: "perp-SOL", symbol: "SOL", label: "SOL Perp", market: "perp", coin: "SOL", dex: "main" },
  { id: "perp-HYPE", symbol: "HYPE", label: "HYPE Perp", market: "perp", coin: "HYPE", dex: "main" },
  { id: "perp-PURR", symbol: "PURR", label: "PURR Perp", market: "perp", coin: "PURR", dex: "main" },
  {
    id: "spot-PURR",
    symbol: "PURR/USDC",
    label: "PURR Spot",
    market: "spot",
    coin: "PURR/USDC",
    dex: "spot",
  },
];

export { loadFullAssets as loadHyperliquidAssets };

export function filterAssets(assets: TerminalAsset[], query: string): TerminalAsset[] {
  const q = query.trim().toLowerCase();
  if (!q) return assets.slice(0, 50);
  return assets
    .filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.label.toLowerCase().includes(q) ||
        a.coin.toLowerCase().includes(q) ||
        (a.dex?.toLowerCase().includes(q) ?? false),
    )
    .slice(0, 50);
}
