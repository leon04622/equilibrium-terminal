import type { ImmersionCommandRow } from "@/types/unified-operations";

export class OperationalImmersionDeskEngine {
  static commands(): ImmersionCommandRow[] {
    return [
      { id: "imm-omni", command: "⌘K", description: "OmniBar — nav, trade, /ai" },
      { id: "imm-chart", command: "/chart", description: "Focus chart panel" },
      { id: "imm-intel", command: "/intel", description: "Tactical intelligence wire" },
      { id: "imm-summarize", command: "/summarize", description: "Operator AI compression" },
      { id: "imm-expand", command: "EXPAND", description: "Toggle full institutional OS" },
      { id: "imm-focus", command: "widget:focus", description: "Cross-panel focus bus" },
      { id: "imm-chain", command: "/trade → ticket", description: "Command chain to execution" },
    ];
  }
}
