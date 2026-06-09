import type { MarketCommandSnapshot } from "@/types/market-command";

export class MarketCommandBriefEngine {
  static brief(partial: Pick<MarketCommandSnapshot, "overview" | "incidents" | "telemetry">): string {
    const stress = partial.overview.find((o) => o.domain === "stress");
    const tier = partial.telemetry.systemicTier;
    const inc = partial.incidents.filter((i) => i.severity === "critical").length;

    return [
      `Situational score ${partial.telemetry.situationalScore} · systemic ${tier}.`,
      stress ? `Stress ${stress.value} (${stress.status}).` : "",
      inc > 0 ? `${inc} critical incident(s) — incident command engaged.` : "No critical incidents — standard watch.",
    ]
      .filter(Boolean)
      .join(" ");
  }
}
