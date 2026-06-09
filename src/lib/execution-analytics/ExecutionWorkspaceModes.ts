import type { ExecutionWorkspaceMode, ExecutionWorkspaceModeId } from "@/types/execution-analytics";

export const EXECUTION_WORKSPACE_MODES: ExecutionWorkspaceMode[] = [
  {
    id: "scalping",
    label: "Scalping",
    description: "Tight DOM, slippage radar, fast tape",
    panels: ["hyperbook", "domladder", "slippageradar", "chart", "ticket"],
    chartOverlays: ["liquidity_heatmap", "aggressor_flow", "imbalance"],
  },
  {
    id: "liquidity_monitor",
    label: "Liquidity monitor",
    description: "Depth, voids, resting liquidity analysis",
    panels: ["domladder", "slippageradar", "hyperbook", "execintel"],
    chartOverlays: ["liquidity_heatmap", "depth_overlay"],
  },
  {
    id: "volatility_execution",
    label: "Volatility execution",
    description: "Spread expansion and slippage under stress",
    panels: ["chart", "slippageradar", "alerts", "ticket"],
    chartOverlays: ["event_markers", "liquidation_zones", "imbalance"],
  },
  {
    id: "multi_venue",
    label: "Multi-venue",
    description: "Cross-exchange execution context",
    panels: ["execintel", "hyperbook", "marketcoverage", "chart"],
    chartOverlays: ["liquidity_heatmap", "funding"],
  },
  {
    id: "hf_monitor",
    label: "HF monitor",
    description: "High-frequency flow and sweep detection",
    panels: ["domladder", "intelligence", "slippageradar", "chart"],
    chartOverlays: ["aggressor_flow", "cvd", "volume_profile"],
  },
];

export function modeById(id: ExecutionWorkspaceModeId): ExecutionWorkspaceMode {
  return EXECUTION_WORKSPACE_MODES.find((m) => m.id === id) ?? EXECUTION_WORKSPACE_MODES[0]!;
}
