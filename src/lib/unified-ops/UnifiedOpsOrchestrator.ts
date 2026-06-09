import { AiWorkflowEmbeddingDeskEngine } from "@/lib/unified-ops/AiWorkflowEmbeddingDeskEngine";
import { CrossDeviceContinuityDeskEngine } from "@/lib/unified-ops/CrossDeviceContinuityDeskEngine";
import { CrossSystemPropagationDeskEngine } from "@/lib/unified-ops/CrossSystemPropagationDeskEngine";
import { GlobalContextDeskEngine } from "@/lib/unified-ops/GlobalContextDeskEngine";
import { InstitutionalDesignDeskEngine } from "@/lib/unified-ops/InstitutionalDesignDeskEngine";
import { OperationalImmersionDeskEngine } from "@/lib/unified-ops/OperationalImmersionDeskEngine";
import { TerminalMemoryContinuityEngine } from "@/lib/unified-ops/TerminalMemoryContinuityEngine";
import { UNIFIED_OPS_DASHBOARD_MODES } from "@/lib/unified-ops/UnifiedOpsDashboardModes";
import { UnifiedOpsBriefEngine } from "@/lib/unified-ops/UnifiedOpsBriefEngine";
import { UnifiedOpsTelemetry } from "@/lib/unified-ops/UnifiedOpsTelemetry";
import { WorkflowOrchestrationDeskEngine } from "@/lib/unified-ops/WorkflowOrchestrationDeskEngine";
import { WorkspaceModesDeskEngine } from "@/lib/unified-ops/WorkspaceModesDeskEngine";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { UnifiedOpsModeId, UnifiedOpsSnapshot } from "@/types/unified-operations";

const MODE_STORAGE = "eq-unified-ops-mode-v1";

function readMode(): UnifiedOpsModeId {
  if (typeof window === "undefined") return "command_center";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && UNIFIED_OPS_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as UnifiedOpsModeId;
    }
  } catch {
    /* ignore */
  }
  return "command_center";
}

export class UnifiedOpsOrchestrator {
  static snapshot(): UnifiedOpsSnapshot {
    UnifiedOpsTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const activeTerminalMode = useAdaptiveWorkspaceStore.getState().mode;

    const workflowCoordination = WorkflowOrchestrationDeskEngine.coordination();
    const globalContext = GlobalContextDeskEngine.context();
    const eventPropagation = CrossSystemPropagationDeskEngine.rules();
    const operationalModes = WorkspaceModesDeskEngine.modes();
    const continuity = TerminalMemoryContinuityEngine.items();
    const immersionCommands = OperationalImmersionDeskEngine.commands();
    const designSystem = InstitutionalDesignDeskEngine.tokens();
    const crossDevice = CrossDeviceContinuityDeskEngine.channels();
    const aiEmbedding = AiWorkflowEmbeddingDeskEngine.workflows();

    const telemetry = UnifiedOpsTelemetry.snapshot({
      linkedSystems: globalContext.length,
      propagationRules: eventPropagation.length,
      continuityItems: continuity.length,
    });

    const partial = {
      globalContext,
      workflowCoordination,
      activeTerminalMode,
      telemetry,
    };

    return {
      asset,
      workflowCoordination,
      globalContext,
      eventPropagation,
      operationalModes,
      continuity,
      immersionCommands,
      designSystem,
      crossDevice,
      aiEmbedding,
      unifiedBrief: UnifiedOpsBriefEngine.brief(partial),
      activeTerminalMode,
      dashboardModes: UNIFIED_OPS_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      unifiedScore: telemetry.unifiedScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: UnifiedOpsModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }

  static applyOperationalMode(modeId: string): void {
    const row = WorkspaceModesDeskEngine.modes().find((m) => m.id === modeId);
    if (row) {
      useAdaptiveWorkspaceStore.getState().setMode(row.terminalMode);
    }
  }
}
