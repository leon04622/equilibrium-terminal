import { EXECUTION_WORKSPACE_MODES } from "@/lib/execution-analytics/ExecutionWorkspaceModes";
import type { ExecutionWorkspaceRow, LiveExecDeskId } from "@/types/live-execution";
import type { ExecutionWorkspaceModeId } from "@/types/execution-analytics";

const DESKS: Array<{
  id: LiveExecDeskId;
  label: string;
  analyticsMode: ExecutionWorkspaceModeId;
}> = [
  { id: "scalping", label: "Scalping desk", analyticsMode: "scalping" },
  { id: "derivatives", label: "Derivatives desk", analyticsMode: "volatility_execution" },
  { id: "macro", label: "Macro desk", analyticsMode: "multi_venue" },
  { id: "volatility", label: "Volatility desk", analyticsMode: "volatility_execution" },
  { id: "treasury", label: "Treasury desk", analyticsMode: "liquidity_monitor" },
  { id: "liquidity", label: "Liquidity monitor", analyticsMode: "liquidity_monitor" },
  { id: "market_making", label: "Market-making desk", analyticsMode: "hf_monitor" },
];

export class ProfessionalExecutionWorkspaceEngine {
  static workspaces(): ExecutionWorkspaceRow[] {
    return DESKS.map((d) => {
      const mode = EXECUTION_WORKSPACE_MODES.find((m) => m.id === d.analyticsMode);
      return {
        id: d.id,
        label: d.label,
        analyticsMode: d.analyticsMode,
        primaryPanels: mode?.panels ?? ["hyperbook", "chart", "ticket"],
      };
    });
  }

  static deskById(id: LiveExecDeskId) {
    return DESKS.find((d) => d.id === id);
  }
}
