import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ContinuityRow } from "@/types/unified-operations";

export class TerminalMemoryContinuityEngine {
  static items(): ContinuityRow[] {
    const now = Date.now();
    const terminal = useTerminalStore.getState();
    const workflow = useTraderWorkflowStore.getState();
    const adaptive = useAdaptiveWorkspaceStore.getState();

    return [
      {
        id: "cont-layout",
        domain: "layout",
        state: adaptive.lastOrchestration ? `mode ${adaptive.mode}` : "default",
        updatedAt: adaptive.lastOrchestration?.appliedAt ?? now,
      },
      {
        id: "cont-asset",
        domain: "market_focus",
        state: terminal.selectedCoin,
        updatedAt: now,
      },
      {
        id: "cont-journal",
        domain: "research",
        state: `${workflow.journal.length} journal · ${workflow.theses.length} thesis`,
        updatedAt: now,
      },
      {
        id: "cont-watch",
        domain: "watchlists",
        state: `${workflow.watchlistIntel.length} watch intel rows`,
        updatedAt: now,
      },
      {
        id: "cont-ai",
        domain: "ai_thread",
        state: `${terminal.ai.messages.length} messages`,
        updatedAt: now,
      },
    ];
  }
}
