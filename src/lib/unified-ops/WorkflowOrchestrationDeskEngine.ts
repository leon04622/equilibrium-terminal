import { LayoutOrchestrator } from "@/lib/adaptive/LayoutOrchestrator";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import { FULL_WORKSPACE_LAYOUT } from "@/lib/wedge/WedgeManifest";
import type { WorkflowCoordinationRow } from "@/types/unified-operations";

export class WorkflowOrchestrationDeskEngine {
  static coordination(): WorkflowCoordinationRow[] {
    const adaptive = useAdaptiveWorkspaceStore.getState();
    const wedge = useWedgeStore.getState();
    const base = FULL_WORKSPACE_LAYOUT;
    const orch = LayoutOrchestrator.orchestrate(
      base,
      adaptive.mode,
      adaptive.focusMode,
      { respectFocus: true },
    );

    return [
      {
        id: "wf-adapt",
        label: "Adaptive orchestration",
        status: adaptive.autoAdapt ? "live" : "manual",
        detail: orch.reason.slice(0, 56),
      },
      {
        id: "wf-mode",
        label: "Terminal mode",
        status: adaptive.mode,
        detail: `Focus ${adaptive.focusMode} · ${orch.hiddenPanelIds.length} hidden`,
      },
      {
        id: "wf-wedge",
        label: "Workspace scope",
        status: wedge.deskFocusMode ? "HL desk" : "full OS",
        detail: !wedge.deskFocusMode ? "Full institutional OS" : "HL execution wedge",
      },
      {
        id: "wf-sync",
        label: "Panel sync",
        status: adaptive.lastOrchestration ? "synced" : "pending",
        detail: `Emphasis on ${Object.keys(adaptive.panelEmphasis).length} panels`,
      },
    ];
  }
}
