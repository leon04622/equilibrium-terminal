import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import type { RapidResponseRow } from "@/types/live-execution";

export class RapidResponseDeskEngine {
  static events(asset: string): RapidResponseRow[] {
    const rows: RapidResponseRow[] = [];
    const global = GlobalIntelOrchestrator.snapshot();
    const analytics = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const dist = InformationDistributionOrchestrator.snapshot();

    for (const a of analytics.alerts.filter((x) => x.severity !== "info")) {
      rows.push({
        id: a.id,
        event: a.headline.slice(0, 40),
        severity: a.severity,
        action: "Review slippage · DOM · ticket",
      });
    }

    for (const e of global.macroEvents.filter((m) => m.severity >= 70).slice(0, 3)) {
      rows.push({
        id: e.id,
        event: e.summary.slice(0, 40),
        severity: "critical",
        action: "Macro desk · reduce gross",
      });
    }

    for (const inc of dist.incidents.filter((i) => i.status === "active").slice(0, 2)) {
      rows.push({
        id: inc.id,
        event: inc.headline.slice(0, 40),
        severity: inc.severity,
        action: "Incident protocol · verify venues",
      });
    }

    if (rows.length === 0) {
      rows.push({
        id: "resp-clear",
        event: "No elevated response triggers",
        severity: "info",
        action: "Maintain standard execution posture",
      });
    }

    return rows;
  }
}
