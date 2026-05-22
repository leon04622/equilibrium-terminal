import { terminalBus } from "@/store/eventBus";
import { useTerminalStore } from "@/store/terminalStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { AssetWorkspaceMode } from "@/types/trader-workflow";

const MODE_PANELS: Record<AssetWorkspaceMode, string[]> = {
  standard: ["chart", "hyperbook", "intelligence", "ticket", "surveillance"],
  execution: ["ticket", "domladder", "hyperbook", "slippageradar", "chart"],
  research: ["chart", "knowledgegraph", "intelligence", "research", "traderjournal"],
  surveillance: ["surveillance", "chart", "macro", "intelligence", "alerts"],
};

/**
 * Opens a unified asset operational workspace — interconnected panel focus sequence.
 */
export class AssetWorkspaceOrchestrator {
  static open(
    coin: string,
    options?: { mode?: AssetWorkspaceMode; source?: string },
  ): void {
    const upper = coin.toUpperCase();
    const mode = options?.mode ?? useTraderWorkflowStore.getState().assetWorkspaceMode;
    const panels = MODE_PANELS[mode];

    useTerminalStore.getState().selectAssetByCoin(upper, options?.source ?? "workflow");
    useTraderWorkflowStore.getState().setAssetWorkspace(upper, mode);

    terminalBus.emit("workflow:open-asset", { coin: upper, mode, panels });

    panels.forEach((widgetId, i) => {
      window.setTimeout(() => {
        terminalBus.emit("widget:focus", { widgetId });
      }, i * 120);
    });

    terminalBus.emit("widget:focus", { widgetId: panels[0] });
  }
}
