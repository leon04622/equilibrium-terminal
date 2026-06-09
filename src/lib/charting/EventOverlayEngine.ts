import type { IntelligenceItem, NormalizedTrade } from "@/types/terminal-schema";
import type { ChartEventKind, ChartEventMarker } from "@/types/chart-analytics";

function kindFromIntel(item: IntelligenceItem): ChartEventKind {
  const t = item.title.toLowerCase();
  if (t.includes("liquidat")) return "liquidation";
  if (t.includes("whale") || t.includes("large")) return "whale";
  if (t.includes("funding")) return "funding";
  if (t.includes("macro")) return "macro";
  return "intelligence";
}

export class EventOverlayEngine {
  static fromIntelligence(items: IntelligenceItem[], limit = 24): ChartEventMarker[] {
    return items.slice(0, limit).map((item) => ({
      id: `intel-${item.id}`,
      time: Math.floor(item.timestamp / 1000),
      kind: kindFromIntel(item),
      label: item.title.slice(0, 48),
      severity: item.severity,
      price: null,
    }));
  }

  static fromTrades(trades: NormalizedTrade[], mid: number | null): ChartEventMarker[] {
    if (!mid) return [];
    const large = trades.filter((t) => t.notionalUsd >= 25_000).slice(0, 12);
    return large.map((t) => ({
      id: `trade-${t.tid}`,
      time: Math.floor(t.time / 1000),
      kind: t.side === "buy" ? "whale" : "liquidation",
      label: `${t.side.toUpperCase()} ${t.size.toFixed(4)} @ ${t.price.toFixed(2)}`,
      severity: t.notionalUsd >= 100_000 ? "critical" : "watch",
      price: t.price,
    }));
  }

  static merge(...groups: ChartEventMarker[][]): ChartEventMarker[] {
    const map = new Map<string, ChartEventMarker>();
    for (const g of groups) {
      for (const m of g) map.set(m.id, m);
    }
    return Array.from(map.values()).sort((a, b) => a.time - b.time).slice(-48);
  }
}
