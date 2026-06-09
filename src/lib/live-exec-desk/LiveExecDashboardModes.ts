import type { LiveExecDashboardMode } from "@/types/live-execution";

export const LIVE_EXEC_DASHBOARD_MODES: LiveExecDashboardMode[] = [
  {
    id: "floor_command",
    label: "Floor command",
    description: "Full execution floor — book, DOM, ticket, positions.",
    panels: ["liveexec", "hyperbook", "domladder", "ticket", "positions"],
  },
  {
    id: "scalp_flow",
    label: "Scalp flow",
    description: "Tape, slippage, rapid context.",
    panels: ["liveexec", "hyperbook", "slippageradar", "chart"],
  },
  {
    id: "vol_response",
    label: "Vol response",
    description: "Volatility and rapid response triggers.",
    panels: ["liveexec", "slippageradar", "alerts", "globaldesk"],
  },
  {
    id: "desk_coordination",
    label: "Desk coordination",
    description: "Shared execution visibility and desk comms.",
    panels: ["liveexec", "deskops", "collab", "positions"],
  },
  {
    id: "multi_asset",
    label: "Multi-asset",
    description: "Watchlist scan and cross-venue monitoring.",
    panels: ["liveexec", "execintel", "marketcoverage", "chart"],
  },
];
