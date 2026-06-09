import { WorkflowEmbeddingEngine } from "@/lib/proprietary/WorkflowEmbeddingEngine";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { AdoptionLeverRow } from "@/types/global-infrastructure";

export class AdoptionStrategyEngine {
  static levers(): AdoptionLeverRow[] {
    const metrics = WorkflowEmbeddingEngine.metrics();
    const ent = useProductionConfigStore.getState().entitlements;
    const ops = metrics.find((m) => m.id === "embed-ops");
    const collab = metrics.find((m) => m.id === "embed-collab");

    return [
      {
        lever: "Workflow Embedding",
        strength: ops?.score ?? 50,
        embedded: (ops?.score ?? 0) > 60,
      },
      {
        lever: "Organizational Dependency",
        strength: collab?.score ?? 45,
        embedded: ent.teamNetEnabled,
      },
      {
        lever: "Collaborative Systems",
        strength: collab?.score ?? 45,
        embedded: ent.teamNetEnabled,
      },
      {
        lever: "Operational Continuity",
        strength: ops?.score ?? 50,
        embedded: true,
      },
      {
        lever: "Intelligence Advantages",
        strength: ent.proprietaryIntelEnabled ? 82 : 40,
        embedded: ent.proprietaryIntelEnabled,
      },
      {
        lever: "Execution Integration",
        strength: 78,
        embedded: true,
      },
    ];
  }
}
