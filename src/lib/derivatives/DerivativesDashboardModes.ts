import type { DerivativesDashboardMode } from "@/types/derivatives-intelligence";

export const DERIVATIVES_DASHBOARD_MODES: DerivativesDashboardMode[] = [
  {
    id: "vol_trader",
    label: "Vol trader",
    description: "IV, skew, term structure, and regime classification.",
    panels: ["derivdesk", "chart", "macro", "surveillance"],
    chartOverlays: ["funding", "open_interest"],
  },
  {
    id: "options_chain",
    label: "Options chain",
    description: "Strike ladders, Greeks, and OI concentration.",
    panels: ["derivdesk", "hyperbook", "intelligence"],
    chartOverlays: ["event_markers"],
  },
  {
    id: "funding_monitor",
    label: "Funding monitor",
    description: "Cross-venue funding, OI growth, and crowding.",
    panels: ["derivdesk", "execintel", "marketcoverage", "ingestion"],
    chartOverlays: ["funding"],
  },
  {
    id: "gamma_desk",
    label: "Gamma desk",
    description: "Dealer gamma, pin risk, and squeeze environments.",
    panels: ["derivdesk", "domladder", "slippageradar", "chart"],
    chartOverlays: ["liquidation_zones", "imbalance"],
  },
  {
    id: "cross_market",
    label: "Cross-market",
    description: "Spot/perp basis, fragmentation, and vol/price relationships.",
    panels: ["derivdesk", "portfoliodesk", "ecosystem"],
    chartOverlays: ["funding", "open_interest"],
  },
];
