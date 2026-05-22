/** Phase 22 — Institutional Reliability & Trust Infrastructure. */

export interface RuntimeHealthSnapshot {
  websocketHealth: "healthy" | "degraded" | "disconnected";
  reconnectAttempts: number;
  lastMessageLagMs: number;
  streamThroughputPerMin: number;
  renderCostScore: number;
  memoryPressure: "low" | "moderate" | "high";
  cpuPressure: "low" | "moderate" | "high";
  stateSyncConsistency: number;
  updatedAt: number;
}

export interface DataReliabilitySnapshot {
  timestampIntegrity: number;
  sourceVerification: number;
  redundancyCoverage: number;
  conflictCount: number;
  staleFeedCount: number;
  streamIntegrityScore: number;
  qualityScore: number;
  updatedAt: number;
}

export interface VolatilityResilienceSnapshot {
  highVolMode: boolean;
  triggerReason: string;
  alertThrottle: boolean;
  animationSuppression: boolean;
  fallbackRoutingActive: boolean;
  updatedAt: number;
}

export interface ExecutionReliabilitySnapshot {
  confirmationClarity: number;
  slippageWarningCoverage: number;
  retrySafetyScore: number;
  reconciliationHealth: number;
  failedOrderCount: number;
  updatedAt: number;
}

export interface ReliabilityAuditEntry {
  id: string;
  at: number;
  category:
    | "runtime"
    | "data"
    | "execution"
    | "alert"
    | "workspace"
    | "recovery";
  severity: "info" | "watch" | "critical";
  summary: string;
  detail: string;
}

export interface ReliabilitySnapshot {
  runtime: RuntimeHealthSnapshot;
  data: DataReliabilitySnapshot;
  volatility: VolatilityResilienceSnapshot;
  execution: ExecutionReliabilitySnapshot;
  trustScore: number;
  updatedAt: number;
}
