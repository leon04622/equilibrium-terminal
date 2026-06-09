import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { ExecutionCoordinationDeskEngine } from "@/lib/live-exec-desk/ExecutionCoordinationDeskEngine";
import { ExecutionImmersionDeskEngine } from "@/lib/live-exec-desk/ExecutionImmersionDeskEngine";
import { LIVE_EXEC_DASHBOARD_MODES } from "@/lib/live-exec-desk/LiveExecDashboardModes";
import { LiveExecBriefEngine } from "@/lib/live-exec-desk/LiveExecBriefEngine";
import { LiveExecTelemetry } from "@/lib/live-exec-desk/LiveExecTelemetry";
import { LiveExecutionSurfaceEngine } from "@/lib/live-exec-desk/LiveExecutionSurfaceEngine";
import { MultiAssetMonitoringEngine } from "@/lib/live-exec-desk/MultiAssetMonitoringEngine";
import { PerformanceLatencyDeskEngine } from "@/lib/live-exec-desk/PerformanceLatencyDeskEngine";
import { ProfessionalExecutionWorkspaceEngine } from "@/lib/live-exec-desk/ProfessionalExecutionWorkspaceEngine";
import { RapidResponseDeskEngine } from "@/lib/live-exec-desk/RapidResponseDeskEngine";
import { RealTimeExecutionContextEngine } from "@/lib/live-exec-desk/RealTimeExecutionContextEngine";
import { TraderSessionContinuityDeskEngine } from "@/lib/live-exec-desk/TraderSessionContinuityDeskEngine";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { LiveExecDeskId, LiveExecModeId, LiveExecSnapshot } from "@/types/live-execution";

const DESK_STORAGE = "eq-live-exec-desk-v1";
const MODE_STORAGE = "eq-live-exec-mode-v1";

function readDesk(): LiveExecDeskId {
  if (typeof window === "undefined") return "scalping";
  try {
    const raw = localStorage.getItem(DESK_STORAGE);
    if (raw && ProfessionalExecutionWorkspaceEngine.deskById(raw as LiveExecDeskId)) {
      return raw as LiveExecDeskId;
    }
  } catch {
    /* ignore */
  }
  return "scalping";
}

function readMode(): LiveExecModeId {
  if (typeof window === "undefined") return "floor_command";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && LIVE_EXEC_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as LiveExecModeId;
    }
  } catch {
    /* ignore */
  }
  return "floor_command";
}

export class LiveExecOrchestrator {
  static snapshot(): LiveExecSnapshot {
    LiveExecTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const activeDesk = readDesk();
    const desk = ProfessionalExecutionWorkspaceEngine.deskById(activeDesk);
    const activeAnalyticsMode = desk?.analyticsMode ?? "scalping";

    const analytics = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const execStore = useExecutionIntelligenceStore.getState();
    const positions = useTerminalStore.getState().positions?.length ?? 0;

    const workspaces = ProfessionalExecutionWorkspaceEngine.workspaces();
    const surfaces = LiveExecutionSurfaceEngine.surfaces();
    const context = RealTimeExecutionContextEngine.context(asset);
    const multiAsset = MultiAssetMonitoringEngine.scan();
    const rapidResponse = RapidResponseDeskEngine.events(asset);
    const coordination = ExecutionCoordinationDeskEngine.feed();
    const performance = PerformanceLatencyDeskEngine.metrics(asset);
    const continuity = TraderSessionContinuityDeskEngine.items();
    const hotkeys = ExecutionImmersionDeskEngine.hotkeys();

    const telemetry = LiveExecTelemetry.snapshot({
      openPositions: positions,
      activeAlerts: analytics.alerts.filter((a) => a.severity !== "info").length,
      pipelineActive: execStore.pipelineActive,
      execConfidence: analytics.executionConfidence,
    });

    const partial = { asset, context, rapidResponse, telemetry };

    return {
      asset,
      workspaces,
      surfaces,
      context,
      multiAsset,
      rapidResponse,
      coordination,
      performance,
      continuity,
      hotkeys,
      liveBrief: LiveExecBriefEngine.brief(partial),
      activeDesk,
      activeAnalyticsMode,
      dashboardModes: LIVE_EXEC_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      liveExecScore: telemetry.liveExecScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: LiveExecModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }

  static applyDesk(deskId: LiveExecDeskId): void {
    const desk = ProfessionalExecutionWorkspaceEngine.deskById(deskId);
    if (!desk) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(DESK_STORAGE, deskId);
    }
    ExecutionAnalyticsOrchestrator.setActiveMode(desk.analyticsMode);
    if (deskId === "scalping") useAdaptiveWorkspaceStore.getState().setMode("scalping");
    else if (deskId === "derivatives" || deskId === "volatility") {
      useAdaptiveWorkspaceStore.getState().setMode("execution");
    } else if (deskId === "macro") useAdaptiveWorkspaceStore.getState().setMode("macro");
    else if (deskId === "treasury") useAdaptiveWorkspaceStore.getState().setMode("portfolio");
  }
}
