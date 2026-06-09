import { CrossMarketEngine } from "@/lib/knowledge-graph/CrossMarketEngine";
import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { CrossAssetVizRow } from "@/types/market-command";

export class CrossAssetVisualizationEngine {
  static links(asset: string): CrossAssetVizRow[] {
    const cm = CrossMarketEngine.analyze().map((i) => ({
      id: i.id,
      link: i.headline,
      assets: i.coins.join(", ") || asset,
      priority: i.priority,
    }));

    const macro = useMarketAtmosphereStore.getState().macro.map((m) => ({
      id: `macro-${m.symbol}`,
      link: `${m.label} ${m.changePct >= 0 ? "+" : ""}${m.changePct.toFixed(2)}%`,
      assets: `${m.symbol} · ${asset}`,
      priority: Math.min(100, 50 + Math.abs(m.changePct) * 6),
    }));

    const global = GlobalIntelOrchestrator.snapshot().crossAsset.slice(0, 4).map((c) => ({
      id: c.id,
      link: c.headline,
      assets: c.assets.join(", "),
      priority: c.priority,
    }));

    return [...cm, ...macro, ...global].sort((a, b) => b.priority - a.priority).slice(0, 12);
  }
}
