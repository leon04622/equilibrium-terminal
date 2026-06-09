import { ComponentRegistryEngine } from "@/lib/operator-guide/ComponentRegistryEngine";
import { AiContextualExplainEngine } from "@/lib/operator-guide/AiContextualExplainEngine";
import { OperationalExplainEngine } from "@/lib/operator-guide/OperationalExplainEngine";
import { OPERATOR_GUIDE_DASHBOARD_MODES } from "@/lib/operator-guide/OperatorGuideDashboardModes";
import { OperatorGuideTelemetryEngine } from "@/lib/operator-guide/OperatorGuideTelemetry";
import { ReplayLearningEngine } from "@/lib/operator-guide/ReplayLearningEngine";
import { ScenarioLibraryEngine } from "@/lib/operator-guide/ScenarioLibraryEngine";
import { WorkflowWalkthroughEngine } from "@/lib/operator-guide/WorkflowWalkthroughEngine";
import { terminalBus } from "@/store/eventBus";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { OperatorGuideModeId, OperatorGuideSnapshot } from "@/types/operator-guide";

const MODE_STORAGE = "eq-operator-guide-mode-v1";

function readMode(): OperatorGuideModeId {
  if (typeof window === "undefined") return "desk_mastery";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && OPERATOR_GUIDE_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as OperatorGuideModeId;
    }
  } catch {
    /* ignore */
  }
  return "desk_mastery";
}

export class OperatorGuideOrchestrator {
  static snapshot(): OperatorGuideSnapshot {
    const ui = useOperatorGuideStore.getState();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const registry = ComponentRegistryEngine.all();
    const scenarios = ScenarioLibraryEngine.all();
    const workflows = WorkflowWalkthroughEngine.all();

    const selectedEntry = ui.selectedTargetId
      ? ComponentRegistryEngine.resolve(ui.selectedTargetId)
      : null;
    const operational = selectedEntry
      ? OperationalExplainEngine.explain(selectedEntry, ui.selectedAudience)
      : null;
    const contextual = operational
      ? AiContextualExplainEngine.explain(selectedEntry!, ui.selectedAudience)
      : null;

    const activeReplay = ui.activeReplay
      ? ReplayLearningEngine.syncReplayState() ?? ui.activeReplay
      : null;

    const telemetry = OperatorGuideTelemetryEngine.snapshot({
      registrySize: registry.length,
      scenarioCount: scenarios.length,
      workflowCount: workflows.length,
      explainActive: ui.explainModeActive,
      replayActive: activeReplay != null,
    });

    return {
      asset,
      explainModeActive: ui.explainModeActive,
      sidePanelOpen: ui.sidePanelOpen,
      selectedTargetId: ui.selectedTargetId,
      selectedEntry,
      selectedAudience: ui.selectedAudience,
      operational,
      contextual,
      registry,
      scenarios,
      workflows,
      activeWorkflow: ui.activeWorkflowId
        ? WorkflowWalkthroughEngine.get(ui.activeWorkflowId)
        : null,
      activeWorkflowStep: ui.activeWorkflowStep,
      activeReplay,
      dashboardModes: OPERATOR_GUIDE_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      guideScore: telemetry.guideScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: OperatorGuideModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
    const mode = OPERATOR_GUIDE_DASHBOARD_MODES.find((m) => m.id === id);
    if (mode) {
      for (const panel of mode.panels.slice(0, 2)) {
        terminalBus.emit("widget:focus", { widgetId: panel });
      }
    }
  }

  static selectTarget(targetId: string): void {
    useOperatorGuideStore.getState().selectTarget(targetId);
    OperatorGuideTelemetryEngine.recordExplainSession();
  }

  static startScenario(scenarioId: string): void {
    // Never let a replay button be a dead click: if the requested scenario id
    // can't be resolved, fall back to a known-good scenario.
    const ok = ReplayLearningEngine.startScenario(scenarioId);
    if (!ok && scenarioId !== "sc-liq-cascade-btc") {
      ReplayLearningEngine.startScenario("sc-liq-cascade-btc");
    }
  }

  static stopReplay(): void {
    ReplayLearningEngine.stopReplay();
  }
}
