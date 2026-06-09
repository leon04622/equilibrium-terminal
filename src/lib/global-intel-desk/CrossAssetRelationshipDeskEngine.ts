import { CrossMarketEngine } from "@/lib/knowledge-graph/CrossMarketEngine";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { CrossAssetRow } from "@/types/global-intelligence";

export class CrossAssetRelationshipDeskEngine {
  static relationships(asset: string): CrossAssetRow[] {
    const insights = CrossMarketEngine.analyze().map((i) => ({
      id: i.id,
      category: i.category,
      headline: i.headline,
      assets: i.coins.length > 0 ? i.coins : [asset],
      priority: i.priority,
    }));

    const macro = useMarketAtmosphereStore.getState().macro.map((m) => ({
      id: `xmacro-${m.symbol}`,
      category: "macro_link",
      headline: `${m.label} ${m.changePct >= 0 ? "+" : ""}${m.changePct.toFixed(2)}%`,
      assets: [asset, m.symbol],
      priority: Math.min(100, 50 + Math.abs(m.changePct) * 8),
    }));

    return [...insights, ...macro].sort((a, b) => b.priority - a.priority).slice(0, 12);
  }
}
