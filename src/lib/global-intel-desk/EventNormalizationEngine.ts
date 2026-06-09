import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import type { MacroEvent, MacroEventCategory } from "@/types/global-intelligence";
import type { NewswireCategory } from "@/types/information-distribution";

function mapCategory(cat: NewswireCategory): MacroEventCategory {
  if (cat === "etf") return "ETF";
  if (cat === "macro") return "macro";
  if (cat === "exchange" || cat === "operational") return "exchange";
  if (cat === "stablecoin" || cat === "bridge" || cat === "chain") return "protocol";
  if (cat === "liquidation" || cat === "volatility" || cat === "funding") return "liquidity";
  return "macro";
}

function severityNum(sev: string, score: number): number {
  if (sev === "critical") return Math.min(100, 75 + score * 0.2);
  if (sev === "watch") return Math.min(85, 45 + score * 0.15);
  return Math.min(60, 20 + score * 0.1);
}

export class EventNormalizationEngine {
  static normalize(asset: string): MacroEvent[] {
    const upper = asset.toUpperCase();
    const wire = InformationDistributionOrchestrator.snapshot().newswire.filter(
      (n) => !upper || !n.coin || n.coin.toUpperCase() === upper,
    );

    return wire.slice(0, 16).map((n) => ({
      id: `evt-${n.id}`,
      category: mapCategory(n.category),
      severity: severityNum(n.severity, n.compositeScore),
      affectedAssets: n.coin ? [n.coin, "BTC"] : ["BTC", "ETH"],
      timestamp: n.timestamp,
      summary: n.detail || n.headline,
      source: n.source,
    }));
  }
}
