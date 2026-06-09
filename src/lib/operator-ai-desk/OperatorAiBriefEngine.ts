import type { OperatorAiSnapshot } from "@/types/operator-ai";

export class OperatorAiBriefEngine {
  static brief(
    snapshot: Pick<
      OperatorAiSnapshot,
      "contextualInsights" | "intelSummaries" | "briefings" | "telemetry"
    >,
  ): string {
    const critical = snapshot.intelSummaries.filter((s) => s.severity === "critical").length;
    if (critical > 0) {
      return `${critical} critical intel item(s) · ${snapshot.contextualInsights.length} context layers · assist ${snapshot.telemetry.assistantScore}`;
    }
    const top = snapshot.briefings[0];
    if (top) {
      return `${top.category}: ${top.headline} · ${snapshot.telemetry.contextSources} systems linked`;
    }
    return `Operator assist active · ${snapshot.contextualInsights.length} insights · score ${snapshot.telemetry.assistantScore}`;
  }
}
