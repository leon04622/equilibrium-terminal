import { SessionContinuity } from "@/lib/workflow/SessionContinuity";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { SessionContinuityRow } from "@/types/live-execution";

export class TraderSessionContinuityDeskEngine {
  static items(): SessionContinuityRow[] {
    const terminal = useTerminalStore.getState();
    const workflow = useTraderWorkflowStore.getState();
    const session = SessionContinuity.buildSessionState(terminal.selectedCoin);

    return [
      { id: "cont-asset", domain: "market_focus", state: session.selectedCoin ?? "—" },
      { id: "cont-mode", domain: "workspace_mode", state: workflow.assetWorkspaceMode },
      { id: "cont-alert", domain: "alert_workflow", state: workflow.alertWorkflow?.alertId ?? "none" },
      { id: "cont-journal", domain: "journal", state: `${workflow.journal.length} entries` },
      { id: "cont-views", domain: "saved_views", state: `${workflow.savedViews.length} views` },
    ];
  }
}
