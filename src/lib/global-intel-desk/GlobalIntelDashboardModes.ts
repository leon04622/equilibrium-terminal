import type { GlobalIntelDashboardMode } from "@/types/global-intelligence";

export const GLOBAL_INTEL_DASHBOARD_MODES: GlobalIntelDashboardMode[] = [
  {
    id: "macro_command",
    label: "Macro command",
    description: "Rates, regime, calendar, cross-asset links.",
    panels: ["globaldesk", "macro", "newswire"],
  },
  {
    id: "news_wire",
    label: "News wire",
    description: "Ingestion, normalization, distribution quality.",
    panels: ["globaldesk", "newswire", "intelengine"],
  },
  {
    id: "regulatory_watch",
    label: "Regulatory watch",
    description: "Policy, ETF, jurisdictional risk.",
    panels: ["globaldesk", "newswire", "systemicintel"],
  },
  {
    id: "cross_asset",
    label: "Cross-asset",
    description: "Macro–crypto linkage and correlation context.",
    panels: ["globaldesk", "macro", "knowledgegraph"],
  },
  {
    id: "propagation",
    label: "Propagation",
    description: "Event cascades and narrative spread.",
    panels: ["globaldesk", "systemicintel", "memorydesk"],
  },
];
