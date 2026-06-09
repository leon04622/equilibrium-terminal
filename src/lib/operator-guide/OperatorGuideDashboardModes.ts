import type { OperatorGuideDashboardMode } from "@/types/operator-guide";

export const OPERATOR_GUIDE_DASHBOARD_MODES: OperatorGuideDashboardMode[] = [
  {
    id: "desk_mastery",
    label: "Desk mastery",
    description: "Core wedge panels — book, chart, tape, execution path.",
    panels: ["hyperbook", "chart", "intelligence", "ticket", "alerts"],
  },
  {
    id: "execution_ops",
    label: "Execution ops",
    description: "DOM, slippage, positions, live exec surfaces.",
    panels: ["domladder", "slippageradar", "ticket", "positions", "liveexec"],
  },
  {
    id: "intel_surveillance",
    label: "Intel & surveillance",
    description: "Tape, alerts, derivatives, systemic context.",
    panels: ["intelligence", "alerts", "surveillance", "derivdesk", "systemicintel"],
  },
  {
    id: "replay_training",
    label: "Replay training",
    description: "Scenario library, market memory, chart replay.",
    panels: ["explaindesk", "memorydesk", "chart", "surveillance"],
  },
];
