import type { UnifiedOpsDashboardMode } from "@/types/unified-operations";

export const UNIFIED_OPS_DASHBOARD_MODES: UnifiedOpsDashboardMode[] = [
  {
    id: "command_center",
    label: "Command center",
    description: "Orchestration, context, propagation, modes.",
    panels: ["unifiedops", "decision", "dailyops"],
  },
  {
    id: "execution_flow",
    label: "Execution flow",
    description: "Trade path with risk and execution intel linked.",
    panels: ["unifiedops", "ticket", "execintel", "portfoliodesk"],
  },
  {
    id: "intel_fusion",
    label: "Intel fusion",
    description: "Global, systemic, and tactical intelligence unified.",
    panels: ["unifiedops", "globaldesk", "intelengine", "systemicintel"],
  },
  {
    id: "research_continuity",
    label: "Research continuity",
    description: "Memory, research, and AI assist continuity.",
    panels: ["unifiedops", "researchdesk", "memorydesk", "operatordesk"],
  },
  {
    id: "risk_surveillance",
    label: "Risk surveillance",
    description: "Portfolio, derivatives, alerts, mobile sync.",
    panels: ["unifiedops", "derivdesk", "mobiledesk", "alerts"],
  },
];
