import { AiSafetyBoundariesEngine } from "@/lib/operator-ai-desk/AiSafetyBoundariesEngine";
import { ContextualMarketAssistantEngine } from "@/lib/operator-ai-desk/ContextualMarketAssistantEngine";
import { CrossSystemContextEngine } from "@/lib/operator-ai-desk/CrossSystemContextEngine";
import { InferenceInfrastructureEngine } from "@/lib/operator-ai-desk/InferenceInfrastructureEngine";
import { IntelligenceSummarizationDeskEngine } from "@/lib/operator-ai-desk/IntelligenceSummarizationDeskEngine";
import { NaturalLanguageRetrievalEngine } from "@/lib/operator-ai-desk/NaturalLanguageRetrievalEngine";
import { OPERATOR_AI_DASHBOARD_MODES } from "@/lib/operator-ai-desk/OperatorAiDashboardModes";
import { OperatorAiBriefEngine } from "@/lib/operator-ai-desk/OperatorAiBriefEngine";
import { OperatorAiTelemetry } from "@/lib/operator-ai-desk/OperatorAiTelemetry";
import { OperationalBriefingDeskEngine } from "@/lib/operator-ai-desk/OperationalBriefingDeskEngine";
import { ResearchAssistanceDeskEngine } from "@/lib/operator-ai-desk/ResearchAssistanceDeskEngine";
import { WorkflowAccelerationEngine } from "@/lib/operator-ai-desk/WorkflowAccelerationEngine";
import { useOperatorAiStore } from "@/store/useOperatorAiStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { OperatorAiModeId, OperatorAiSnapshot } from "@/types/operator-ai";

const MODE_STORAGE = "eq-operator-ai-mode-v1";

function readMode(): OperatorAiModeId {
  if (typeof window === "undefined") return "desk_assist";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && OPERATOR_AI_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as OperatorAiModeId;
    }
  } catch {
    /* ignore */
  }
  return "desk_assist";
}

export class OperatorAiOrchestrator {
  static snapshot(): OperatorAiSnapshot {
    OperatorAiTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const lastQuery = useOperatorAiStore.getState().lastQuery;

    const contextualInsights = ContextualMarketAssistantEngine.insights(asset);
    const intelSummaries = IntelligenceSummarizationDeskEngine.summaries(asset);
    const workflowSuggestions = WorkflowAccelerationEngine.suggestions(asset);
    const researchAssist = ResearchAssistanceDeskEngine.assist(asset);
    const systemContext = CrossSystemContextEngine.systems(asset);
    const briefings = OperationalBriefingDeskEngine.briefings();
    const retrievalHits = NaturalLanguageRetrievalEngine.retrieve(asset, lastQuery ?? asset);
    const safetyBoundaries = AiSafetyBoundariesEngine.boundaries();
    const inferenceInfra = InferenceInfrastructureEngine.stack();

    const telemetry = OperatorAiTelemetry.snapshot({
      contextSources: systemContext.length,
      summariesGenerated: intelSummaries.length,
      retrievalHits: retrievalHits.length,
    });

    const partial = {
      contextualInsights,
      intelSummaries,
      briefings,
      telemetry,
    };

    return {
      asset,
      contextualInsights,
      intelSummaries,
      workflowSuggestions,
      researchAssist,
      systemContext,
      briefings,
      retrievalHits,
      safetyBoundaries,
      inferenceInfra,
      operatorBrief: OperatorAiBriefEngine.brief(partial),
      dashboardModes: OPERATOR_AI_DASHBOARD_MODES,
      activeMode: readMode(),
      lastQuery,
      telemetry,
      assistantScore: telemetry.assistantScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: OperatorAiModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
