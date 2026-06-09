import { ExecutionAlertEngine } from "@/lib/execution-analytics/ExecutionAlertEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { ChartEventMarker } from "@/types/chart-analytics";

/** Maps execution intelligence into chart overlay markers. */
export class ExecutionChartOverlayBridge {
  static markers(): ChartEventMarker[] {
    const { participants, liquidityVoids, dom } = useExecutionIntelligenceStore.getState();
    const alerts = ExecutionAlertEngine.evaluate();
    const out: ChartEventMarker[] = [];

    for (const p of participants.slice(0, 8)) {
      const price = dom?.levels.find((l) => l.priceTick === p.priceTick)?.price;
      if (price == null) continue;
      out.push({
        id: `exec-p-${p.id}`,
        time: Math.floor(p.detectedAtNs / 1e9),
        kind: "execution",
        label: p.label.slice(0, 40),
        severity: p.kind === "hft_sweep" ? "critical" : "watch",
        price,
      });
    }

    for (const v of liquidityVoids.slice(0, 4)) {
      const price = dom?.levels.find((l) => l.priceTick === v.priceTick)?.price;
      if (price == null) continue;
      out.push({
        id: `void-${v.priceTick}`,
        time: Math.floor(Date.now() / 1000),
        kind: "execution",
        label: `LIQ VOID ${v.side.toUpperCase()}`,
        severity: v.voidScore > 0.8 ? "critical" : "watch",
        price,
      });
    }

    for (const a of alerts.slice(0, 6)) {
      out.push({
        id: a.id,
        time: Math.floor(a.timestamp / 1000),
        kind: "execution",
        label: a.headline,
        severity: a.severity,
        price: dom?.levels[Math.floor(dom.levels.length / 2)]?.price ?? null,
      });
    }

    return out;
  }
}
