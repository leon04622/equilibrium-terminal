import { useEnterpriseOpsStore } from "@/store/useEnterpriseOpsStore";
import { useIndustryIntegrationsStore } from "@/store/useIndustryIntegrationsStore";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import type { WorkflowEmbeddingMetric } from "@/types/proprietary-intelligence";

export class WorkflowEmbeddingEngine {
  static metrics(): WorkflowEmbeddingMetric[] {
    const enterprise = useEnterpriseOpsStore.getState().snapshot;
    const integrations = useIndustryIntegrationsStore.getState().snapshot;
    const collab = useCollaborationStore.getState().snapshot;

    const collabScore = collab?.collaborationScore ?? 0;
    const opsScore = enterprise?.operationalScore ?? 0;
    const integScore = integrations?.integrationScore ?? 0;

    return [
      {
        id: "embed-ops",
        label: "Operational Continuity",
        score: Math.round((opsScore + collabScore) / 2),
        description: "Cross-desk workflows, alerts, and enterprise ops integration depth.",
        dependencyBand: opsScore > 70 ? "high" : "moderate",
      },
      {
        id: "embed-collab",
        label: "Team Collaboration Embedding",
        score: collabScore || 45,
        description: "Shared layouts, annotations, and desk intelligence persistence.",
        dependencyBand: collabScore > 60 ? "high" : "moderate",
      },
      {
        id: "embed-memory",
        label: "Organizational Knowledge Retention",
        score: enterprise?.knowledge.length
          ? Math.min(100, enterprise.knowledge.length * 8)
          : 40,
        description: "Archived research, playbooks, and reaction history.",
        dependencyBand: (enterprise?.knowledge.length ?? 0) > 4 ? "high" : "low",
      },
      {
        id: "embed-connect",
        label: "External Integration Dependency",
        score: integScore,
        description: "API, embed, and partner connectivity lock-in.",
        dependencyBand: integScore > 65 ? "critical" : "moderate",
      },
    ];
  }
}
