import { WorkspaceContextEngine } from "@/lib/adaptive/WorkspaceContextEngine";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { GlobalContextRow } from "@/types/unified-operations";

export class GlobalContextDeskEngine {
  static context(): GlobalContextRow[] {
    const ctx = WorkspaceContextEngine.build();
    const terminal = useTerminalStore.getState();
    const net = useNetworkGraphStore.getState();
    const desk = net.desks.find((d) => d.id === net.activeDeskId);

    return [
      { key: "asset", value: ctx.activeCoin },
      { key: "workflow", value: ctx.workflowPhase },
      { key: "execution", value: ctx.executionState },
      { key: "regime", value: ctx.marketRegime },
      { key: "volatility", value: `${ctx.volatilityScore}` },
      { key: "alert_pressure", value: `${ctx.alertPressure}` },
      { key: "focus_panel", value: ctx.focusPanelId ?? "—" },
      { key: "org_desk", value: desk?.name ?? "LOCAL" },
      { key: "intel_stream", value: `${terminal.intelligence.length} items` },
      { key: "positions", value: `${ctx.positionCount}` },
    ];
  }
}
