/** Phase 43 — Execution analytics, order flow & liquidity visibility. */

import type { ExchangeId } from "@/types/multi-exchange";
import type { ExecutionCopilotFlag } from "@/types/execution-intelligence";

export type ExecutionWorkspaceModeId =
  | "scalping"
  | "liquidity_monitor"
  | "volatility_execution"
  | "multi_venue"
  | "hf_monitor";

export type ExecutionAlertKind =
  | "liquidity_collapse"
  | "aggressive_flow_spike"
  | "slippage_elevated"
  | "spread_expansion"
  | "vol_execution_dislocation"
  | "sweep_cluster";

export interface OrderFlowMetrics {
  aggressiveBuyPct: number;
  aggressiveSellPct: number;
  marketPressure: "buy" | "sell" | "neutral";
  absorptionScore: number;
  sweepCount: number;
  momentumScore: number;
  imbalancePct: number;
}

export interface LiquidityHeatmapRow {
  price: number;
  bidDepth: number;
  askDepth: number;
  heat: number;
  withdrawalRisk: number;
}

export interface LiquidityVisibility {
  heatmap: LiquidityHeatmapRow[];
  restingBidUsd: number;
  restingAskUsd: number;
  depthCollapseRisk: number;
  spoofingScore: number;
  icebergScore: number;
  voidCount: number;
}

export interface ExecutionQualityMetrics {
  slippageBps: number;
  spreadBps: number;
  fillQualityScore: number;
  latencyMs: number;
  liquidityImpactBps: number;
  efficiencyScore: number;
  riskTier: "low" | "elevated" | "high" | "critical";
}

export interface MicrostructureMetrics {
  spreadVelocity: number;
  bookVelocity: number;
  depthShiftPct: number;
  fragmentationScore: number;
  vacuumRisk: number;
  executionPressure: number;
}

export interface CrossVenueExecutionRow {
  exchange: ExchangeId;
  mid: number | null;
  spreadBps: number | null;
  divergenceBps: number | null;
  liquiditySharePct: number;
}

export interface ExecutionAlert {
  id: string;
  kind: ExecutionAlertKind;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  timestamp: number;
}

export interface ExecutionWorkspaceMode {
  id: ExecutionWorkspaceModeId;
  label: string;
  description: string;
  panels: string[];
  chartOverlays: string[];
}

export interface ExecutionTelemetrySnapshot {
  workerActive: boolean;
  packetsPerSecond: number;
  lastPacketSeq: number;
  computeLatencyMs: number;
  replayReady: boolean;
}

export interface ExecutionAnalyticsSnapshot {
  coin: string;
  executionConfidence: number;
  orderFlow: OrderFlowMetrics;
  liquidity: LiquidityVisibility;
  quality: ExecutionQualityMetrics;
  microstructure: MicrostructureMetrics;
  crossVenue: CrossVenueExecutionRow[];
  alerts: ExecutionAlert[];
  copilotFlags: ExecutionCopilotFlag[];
  workspaceModes: ExecutionWorkspaceMode[];
  activeMode: ExecutionWorkspaceModeId;
  telemetry: ExecutionTelemetrySnapshot;
  analyticsScore: number;
  updatedAt: number;
}
