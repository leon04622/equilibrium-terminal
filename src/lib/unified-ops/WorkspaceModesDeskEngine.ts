import type { OperationalModeRow } from "@/types/unified-operations";

export class WorkspaceModesDeskEngine {
  static modes(): OperationalModeRow[] {
    return [
      {
        id: "mode-scalp",
        terminalMode: "scalping",
        label: "Scalping",
        primaryPanels: ["hyperbook", "chart", "domladder", "ticket"],
      },
      {
        id: "mode-macro",
        terminalMode: "macro",
        label: "Macro monitoring",
        primaryPanels: ["macro", "globaldesk", "intelligence"],
      },
      {
        id: "mode-deriv",
        terminalMode: "execution",
        label: "Derivatives desk",
        primaryPanels: ["derivdesk", "chart", "slippageradar"],
      },
      {
        id: "mode-treasury",
        terminalMode: "portfolio",
        label: "Treasury",
        primaryPanels: ["portfoliodesk", "positions", "billingdesk"],
      },
      {
        id: "mode-vol",
        terminalMode: "narrative",
        label: "Volatility",
        primaryPanels: ["systemicintel", "surveillance", "alerts"],
      },
      {
        id: "mode-research",
        terminalMode: "research",
        label: "Research",
        primaryPanels: ["researchdesk", "traderjournal", "copilot"],
      },
      {
        id: "mode-replay",
        terminalMode: "quant",
        label: "Replay analysis",
        primaryPanels: ["memorydesk", "chart", "researchdesk"],
      },
    ];
  }
}
