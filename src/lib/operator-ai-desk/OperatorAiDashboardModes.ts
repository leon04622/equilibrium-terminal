import type { OperatorAiDashboardMode } from "@/types/operator-ai";

export const OPERATOR_AI_DASHBOARD_MODES: OperatorAiDashboardMode[] = [
  {
    id: "desk_assist",
    label: "Desk assist",
    description: "Contextual market assistant + workflow commands.",
    panels: ["operatordesk", "copilot", "intelligence"],
  },
  {
    id: "intel_compress",
    label: "Intel compress",
    description: "Summarize feeds, macro, and wire overload.",
    panels: ["operatordesk", "globaldesk", "newswire"],
  },
  {
    id: "research_flow",
    label: "Research flow",
    description: "Thesis, journal, memory retrieval assist.",
    panels: ["operatordesk", "researchdesk", "memorydesk"],
  },
  {
    id: "cross_context",
    label: "Cross-context",
    description: "Fuse derivatives, portfolio, graph, global intel.",
    panels: ["operatordesk", "systemicintel", "knowledgegraph"],
  },
  {
    id: "briefing_ops",
    label: "Briefing ops",
    description: "Daily briefings and operational summaries.",
    panels: ["operatordesk", "dailyops", "decision"],
  },
];
