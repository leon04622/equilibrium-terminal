import { InstitutionalDesignDeskEngine } from "@/lib/unified-ops/InstitutionalDesignDeskEngine";
import { OperationalImmersionDeskEngine } from "@/lib/unified-ops/OperationalImmersionDeskEngine";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { VisualOrchestrationRow } from "@/types/market-command";

export class VisualOrchestrationEngine {
  static controls(): VisualOrchestrationRow[] {
    const mode = useAdaptiveWorkspaceStore.getState().mode;
    const exp = useTerminalExperienceStore.getState();
    const tokens = InstitutionalDesignDeskEngine.tokens().slice(0, 2);
    const immersion = OperationalImmersionDeskEngine.commands().slice(0, 2);

    return [
      { id: "vis-mode", control: "terminal_mode", state: mode },
      { id: "vis-density", control: "density", state: exp.density },
      { id: "vis-calm", control: "calm_mode", state: exp.calmMode ? "on" : "off" },
      ...tokens.map((t) => ({
        id: `vis-${t.id}`,
        control: t.token,
        state: t.value,
      })),
      ...immersion.map((c) => ({
        id: c.id,
        control: c.command,
        state: c.description,
      })),
    ];
  }
}
