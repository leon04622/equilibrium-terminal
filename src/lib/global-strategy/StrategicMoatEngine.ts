import { ProprietaryIntelligenceOrchestrator } from "@/lib/proprietary/ProprietaryIntelligenceOrchestrator";
import { IndustryTrustEngine } from "@/lib/integrations/IndustryTrustEngine";
import type { StrategicMoatRow } from "@/types/global-infrastructure";

export class StrategicMoatEngine {
  static moats(): StrategicMoatRow[] {
    const prop = ProprietaryIntelligenceOrchestrator.snapshot();
    const trust = IndustryTrustEngine.signals();
    const infraScore =
      trust.infrastructureGrade === "mission_critical"
        ? 92
        : trust.infrastructureGrade === "production"
          ? 78
          : 52;

    const rows: StrategicMoatRow[] = [
      {
        pillar: "proprietary_intel",
        label: "Proprietary Intelligence",
        score: prop.differentiationScore,
        compounding: true,
      },
      {
        pillar: "workflow_dependency",
        label: "Workflow Dependency",
        score: prop.moatScore,
        compounding: true,
      },
      {
        pillar: "integrations",
        label: "Institutional Integrations",
        score: Math.round(trust.partnerCount * 8 + trust.apiUptimePct * 0.5),
        compounding: true,
      },
      {
        pillar: "operational_trust",
        label: "Operational Trust",
        score: trust.institutionalCredibilityScore,
        compounding: true,
      },
      {
        pillar: "org_embedding",
        label: "Organizational Embedding",
        score: Math.round(prop.moatScore * 0.85),
        compounding: true,
      },
      {
        pillar: "market_memory",
        label: "Market Memory",
        score: 76,
        compounding: true,
      },
      {
        pillar: "network_effects",
        label: "Network Effects",
        score: Math.min(100, prop.networkSignals.length * 12 + 40),
        compounding: true,
      },
      {
        pillar: "infra_scale",
        label: "Infrastructure Scale",
        score: infraScore,
        compounding: false,
      },
    ];

    return rows.sort((a, b) => b.score - a.score);
  }
}
