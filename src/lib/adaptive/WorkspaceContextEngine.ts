import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  ExecutionContextState,
  WorkspaceContextSnapshot,
  WorkflowPhase,
} from "@/types/adaptive-workspace";

const SESSION_START = Date.now();

function inferWorkflowPhase(
  execution: ExecutionContextState,
  friction: number,
): WorkflowPhase {
  if (execution === "active_order" || execution === "closing") return "executing";
  if (execution === "in_position" || execution === "staging") return "analyzing";
  if (friction > 0.65) return "reviewing";
  if (friction < 0.25) return "observing";
  return "idle";
}

function inferExecutionState(
  positionCount: number,
  orderPending: boolean,
): ExecutionContextState {
  if (orderPending) return "active_order";
  if (positionCount > 0) return "in_position";
  return "flat";
}

/**
 * Aggregates live terminal signals into a unified workspace context snapshot.
 */
export class WorkspaceContextEngine {
  static build(): WorkspaceContextSnapshot {
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const execution = useExecutionIntelligenceStore.getState();
    const telemetry = useTraderTelemetryStore.getState();

    const stress = atmosphere.stress;
    const regime = atmosphere.regime.regime;
    const slippage = execution.slippage;
    const positionCount = terminal.positions?.length ?? 0;
    const orderPending = false;
    const executionState = inferExecutionState(positionCount, orderPending);
    const friction = telemetry.metrics.cognitiveFrictionScore;

    const volatilityScore = Math.min(
      100,
      Math.round(
        (stress?.velocityRatio ?? 1) * 35 +
          (stress?.score ?? 40) * 0.45 +
          (slippage.velocityTicksPerSec ?? 0) * 2,
      ),
    );

    const focusTrends = telemetry.layoutFocusTrends;
    const focusPanelId =
      focusTrends.length > 0
        ? [...focusTrends].sort((a, b) => b.totalDwellMs - a.totalDwellMs)[0]?.panelId ?? null
        : null;

    const alertPressure = Math.min(
      100,
      Math.round(
        telemetry.metrics.alertFatigueIndex * 40 +
          telemetry.metrics.bypassedCriticalAlerts * 12 +
          telemetry.pendingHesitations.length * 5,
      ),
    );

    return {
      activeCoin: terminal.selectedAsset?.symbol ?? execution.coin ?? "—",
      workflowPhase: inferWorkflowPhase(executionState, friction),
      executionState,
      marketRegime: regime,
      volatilityScore,
      spreadBps: stress?.spreadBps ?? slippage.spreadBps ?? null,
      orderPending,
      positionCount,
      alertPressure,
      slippageRiskTier: slippage.riskTier,
      cognitiveFriction: friction,
      focusPanelId,
      sessionMinutes: Math.floor((Date.now() - SESSION_START) / 60_000),
      updatedAt: Date.now(),
    };
  }
}
