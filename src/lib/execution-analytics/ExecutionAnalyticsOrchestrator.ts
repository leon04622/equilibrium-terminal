import { CrossVenueExecutionEngine } from "@/lib/execution-analytics/CrossVenueExecutionEngine";
import { ExecutionAlertEngine } from "@/lib/execution-analytics/ExecutionAlertEngine";
import { ExecutionQualityEngine } from "@/lib/execution-analytics/ExecutionQualityEngine";
import { ExecutionTelemetry } from "@/lib/execution-analytics/ExecutionTelemetry";
import { EXECUTION_WORKSPACE_MODES } from "@/lib/execution-analytics/ExecutionWorkspaceModes";
import { LiquidityVisibilityEngine } from "@/lib/execution-analytics/LiquidityVisibilityEngine";
import { MicrostructureEngine } from "@/lib/execution-analytics/MicrostructureEngine";
import { OrderFlowAnalyticsEngine } from "@/lib/execution-analytics/OrderFlowAnalyticsEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { ExecutionAnalyticsSnapshot, ExecutionWorkspaceModeId } from "@/types/execution-analytics";

const MODE_STORAGE = "eq-exec-mode-v1";

function readMode(): ExecutionWorkspaceModeId {
  if (typeof window === "undefined") return "scalping";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && EXECUTION_WORKSPACE_MODES.some((m) => m.id === raw)) {
      return raw as ExecutionWorkspaceModeId;
    }
  } catch {
    /* ignore */
  }
  return "scalping";
}

export class ExecutionAnalyticsOrchestrator {
  static snapshot(coin: string): ExecutionAnalyticsSnapshot {
    const store = useExecutionIntelligenceStore.getState();
    ExecutionTelemetry.notePacket(store.lastPacketSeq);

    const orderFlow = OrderFlowAnalyticsEngine.metrics();
    const liquidity = LiquidityVisibilityEngine.snapshot();
    const quality = ExecutionQualityEngine.metrics();
    const microstructure = MicrostructureEngine.analyze();
    const crossVenue = CrossVenueExecutionEngine.context(coin);
    const alerts = ExecutionAlertEngine.evaluate();
    const telemetry = ExecutionTelemetry.snapshot();

    const analyticsScore = Math.round(
      store.executionConfidence * 0.35 +
        quality.efficiencyScore * 0.25 +
        (100 - quality.slippageBps * 2) * 0.15 +
        (100 - liquidity.depthCollapseRisk) * 0.15 +
        orderFlow.absorptionScore * 0.1,
    );

    return {
      coin,
      executionConfidence: store.executionConfidence,
      orderFlow,
      liquidity,
      quality,
      microstructure,
      crossVenue,
      alerts,
      copilotFlags: store.copilotTape,
      workspaceModes: EXECUTION_WORKSPACE_MODES,
      activeMode: readMode(),
      telemetry,
      analyticsScore: Math.min(100, Math.max(0, analyticsScore)),
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: ExecutionWorkspaceModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
