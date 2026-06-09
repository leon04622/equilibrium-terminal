import { AiContextualizationEngine } from "@/lib/systemic-intelligence/AiContextualizationEngine";
import { GlobalMarketOverviewEngine } from "@/lib/market-command/GlobalMarketOverviewEngine";
import { IncidentCommandModeEngine } from "@/lib/market-command/IncidentCommandModeEngine";
import { SystemicRiskCommandEngine } from "@/lib/market-command/SystemicRiskCommandEngine";

/** Phase 9 — AI-assisted situational summarization only; trader retains authority. */
export class SituationalAiSummaryEngine {
  static summarize(asset: string): string {
    const systemic = SystemicRiskCommandEngine.factors(asset);
    const critical = systemic.filter((f) => f.score >= 70).map((f) => f.factor);
    const incidents = IncidentCommandModeEngine.incidents(asset).filter((i) => i.severity === "critical");
    const overview = GlobalMarketOverviewEngine.overview().filter((o) => o.status !== "ok");

    const parts = [AiContextualizationEngine.summary(asset)];

    if (critical.length > 0) {
      parts.push(`Elevated factors: ${critical.join(", ")}.`);
    }
    if (incidents.length > 0) {
      parts.push(`Active incidents: ${incidents.map((i) => i.incident).join(" · ")}.`);
    }
    if (overview.length > 0) {
      parts.push(
        `Market overview flags: ${overview.map((o) => `${o.domain}/${o.metric}`).join(", ")}.`,
      );
    }

    return parts.join(" ");
  }
}
