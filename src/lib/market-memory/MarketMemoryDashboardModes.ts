import type { MarketMemoryDashboardMode } from "@/types/market-memory";

export const MARKET_MEMORY_DASHBOARD_MODES: MarketMemoryDashboardMode[] = [
  {
    id: "replay_desk",
    label: "Replay desk",
    description: "Candle replay with book and intelligence context.",
    panels: ["memorydesk", "chart", "execintel"],
  },
  {
    id: "regime_lab",
    label: "Regime lab",
    description: "Volatility, liquidity, and leverage epoch analysis.",
    panels: ["memorydesk", "derivdesk", "macro"],
  },
  {
    id: "event_archive",
    label: "Event archive",
    description: "Searchable liquidation, funding, and systemic events.",
    panels: ["memorydesk", "alerts", "systemicintel"],
  },
  {
    id: "analog_search",
    label: "Analog search",
    description: "Historical similarity matching across regimes.",
    panels: ["memorydesk", "research", "traderjournal"],
  },
  {
    id: "research_memory",
    label: "Research memory",
    description: "Desk notes, theses, and annotation persistence.",
    panels: ["memorydesk", "traderjournal", "knowledgegraph"],
  },
];
