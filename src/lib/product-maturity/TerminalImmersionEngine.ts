import { TerminalMemoryContinuityEngine } from "@/lib/unified-ops/TerminalMemoryContinuityEngine";
import { FULL_WORKSPACE_LABEL, WEDGE_PRODUCT_LABEL } from "@/lib/wedge/WedgeManifest";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { ImmersionRow } from "@/types/product-maturity";

export class TerminalImmersionEngine {
  static layers(): ImmersionRow[] {
    const mode = useAdaptiveWorkspaceStore.getState().mode;
    const deskFocus = useWedgeStore.getState().deskFocusMode;
    const continuity = TerminalMemoryContinuityEngine.items().slice(0, 3);

    const rows: ImmersionRow[] = [
      {
        id: "imm-identity",
        layer: "terminal_identity",
        state: deskFocus ? FULL_WORKSPACE_LABEL : WEDGE_PRODUCT_LABEL,
      },
      { id: "imm-mode", layer: "operational_mode", state: mode },
      {
        id: "imm-workspace",
        layer: "workspace_scope",
        state: deskFocus ? "full_institutional_os" : "hl_execution_wedge",
      },
    ];

    for (const c of continuity) {
      rows.push({
        id: c.id,
        layer: "continuity",
        state: `${c.domain}: ${c.state}`.slice(0, 40),
      });
    }

    return rows;
  }
}
