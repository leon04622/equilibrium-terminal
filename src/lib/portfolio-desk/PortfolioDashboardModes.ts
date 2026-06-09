import type { PortfolioDashboardMode } from "@/types/portfolio-risk-treasury";

export const PORTFOLIO_DASHBOARD_MODES: PortfolioDashboardMode[] = [
  {
    id: "trader_risk",
    label: "Trader risk",
    description: "Leverage, liquidation proximity, and directional exposure.",
    panels: ["positions", "portfoliodesk", "surveillance", "alerts"],
  },
  {
    id: "treasury_ops",
    label: "Treasury ops",
    description: "Stablecoin balances, liquidity buffers, and custody exposure.",
    panels: ["portfoliodesk", "ecosystem", "enterpriseops", "commercial"],
  },
  {
    id: "portfolio_overview",
    label: "Portfolio overview",
    description: "Unified AUM, PnL, and cross-venue holdings.",
    panels: ["portfoliodesk", "positions", "chart", "intelligence"],
  },
  {
    id: "collateral_mgmt",
    label: "Collateral mgmt",
    description: "Margin health, utilization, and cross-margin dependencies.",
    panels: ["portfoliodesk", "domladder", "slippageradar", "ticket"],
  },
  {
    id: "exposure_monitor",
    label: "Exposure monitor",
    description: "Concentration, correlation stress, and venue fragmentation.",
    panels: ["portfoliodesk", "marketcoverage", "execintel", "ingestion"],
  },
];
