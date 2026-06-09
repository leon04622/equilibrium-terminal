import type { GlobalIntelSnapshot } from "@/types/global-intelligence";

export class GlobalIntelBriefEngine {
  static brief(
    snapshot: Pick<
      GlobalIntelSnapshot,
      "newsFeed" | "macroEvents" | "alerts" | "macroIndicators" | "telemetry"
    >,
  ): string {
    const critical = snapshot.alerts.filter((a) => a.severity === "critical").length;
    const regime = snapshot.macroIndicators[0]?.symbol ?? "macro";
    if (critical > 0) {
      return `${critical} critical global alert(s) · ${snapshot.newsFeed.length} wire items · regime ${regime}`;
    }
    const topEvent = snapshot.macroEvents[0];
    if (topEvent) {
      return `${topEvent.category.toUpperCase()} · ${topEvent.summary.slice(0, 56)} · score ${snapshot.telemetry.globalScore}`;
    }
    return `${snapshot.newsFeed.length} normalized feeds · global score ${snapshot.telemetry.globalScore}`;
  }
}
