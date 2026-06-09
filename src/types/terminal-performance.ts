/** Phase 36 — Low-latency terminal runtime & performance engineering. */

export type StreamPriority = "critical" | "high" | "normal" | "low";

export type StressModeReason =
  | "throughput"
  | "frame_drop"
  | "memory"
  | "manual"
  | "none";

export interface PerformanceBudgets {
  /** Target 60fps — max frame time before warning (ms). */
  frameTimeWarnMs: number;
  frameTimeCriticalMs: number;
  /** OmniBar / command parse budget (ms). */
  commandParseMs: number;
  /** Stream coalesce flush budget per frame (ms). */
  streamFlushMs: number;
  /** WS message → store commit target (ms). */
  wsIngressMs: number;
  /** Heap growth warning (MB). */
  heapWarnMb: number;
  /** Messages per second before stress coalesce. */
  stressThroughputEps: number;
}

export interface RuntimeVitals {
  fps: number;
  frameTimeMs: number;
  frameTimeP95Ms: number;
  longFrames: number;
  droppedFrames: number;
  streamEps: number;
  streamCoalesced: number;
  streamDropped: number;
  lastFlushMs: number;
  wsLatencyMs: number;
  heapMb: number;
  stressActive: boolean;
  stressReason: StressModeReason;
  updatedAt: number;
}

export interface PanelRenderMetric {
  panelId: string;
  renderCount: number;
  lastRenderMs: number;
  avgRenderMs: number;
}
