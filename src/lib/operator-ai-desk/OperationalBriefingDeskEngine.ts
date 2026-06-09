import { DailyBriefingEngine } from "@/lib/daily/DailyBriefingEngine";
import { useDecisionEngineStore } from "@/store/useDecisionEngineStore";
import type { BriefingRow } from "@/types/operator-ai";

export class OperationalBriefingDeskEngine {
  static briefings(): BriefingRow[] {
    const daily = DailyBriefingEngine.build();
    const decision = useDecisionEngineStore.getState().snapshot?.briefing;

    const rows: BriefingRow[] = daily.bullets.map((b) => ({
      id: b.id,
      category: b.category,
      headline: b.headline,
      severity: b.severity,
    }));

    if (decision?.primaryThesis) {
      rows.unshift({
        id: "brief-decision",
        category: "narrative",
        headline: decision.primaryThesis.slice(0, 48),
        severity: "info",
      });
    }

    return rows.slice(0, 12);
  }
}
