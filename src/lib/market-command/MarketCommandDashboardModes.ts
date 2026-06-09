import type { MarketCommandDashboardMode } from "@/types/market-command";

export const MARKET_COMMAND_DASHBOARD_MODES: MarketCommandDashboardMode[] = [
  {
    id: "situation_room",
    label: "Situation room",
    description: "Global overview · cross-asset · org command",
    panels: ["marketcmd", "globaldesk", "marketcoverage", "surveillance"],
  },
  {
    id: "systemic_watch",
    label: "Systemic watch",
    description: "Leverage · contagion · stablecoin · exchange dependency",
    panels: ["marketcmd", "systemicintel", "decision", "alerts"],
  },
  {
    id: "liquidity_map",
    label: "Liquidity map",
    description: "Depth · flows · fragmentation · migration",
    panels: ["marketcmd", "hyperbook", "domladder", "slippageradar"],
  },
  {
    id: "incident_command",
    label: "Incident command",
    description: "Cascades · depegs · outages · crisis clarity",
    panels: ["marketcmd", "newswire", "alerts", "opscommand"],
  },
  {
    id: "cross_asset",
    label: "Cross-asset",
    description: "Crypto · macro · rates · ETF · stablecoin links",
    panels: ["marketcmd", "globaldesk", "macro", "chart"],
  },
];
