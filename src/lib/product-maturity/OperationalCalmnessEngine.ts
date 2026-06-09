import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { CalmnessRow } from "@/types/product-maturity";

export class OperationalCalmnessEngine {
  static signals(): CalmnessRow[] {
    const exp = useTerminalExperienceStore.getState();
    const terminal = useTerminalStore.getState();
    const noisyAlerts = terminal.intelligence.filter((i) => i.severity === "critical").length;

    return [
      {
        id: "calm-mode",
        signal: "calm_mode",
        level: exp.calmMode ? "active" : "off",
        action: exp.calmMode ? "Soft transitions · muted flash" : "Toggle in experience bar",
      },
      {
        id: "calm-motion",
        signal: "reduced_motion",
        level: exp.reducedMotion ? "active" : "off",
        action: "Long-session visual fatigue reduction",
      },
      {
        id: "calm-alerts",
        signal: "intel_noise",
        level: noisyAlerts > 6 ? "elevated" : "controlled",
        action: noisyAlerts > 6 ? "Review alert filters · calm density" : "Within calm threshold",
      },
      {
        id: "calm-hierarchy",
        signal: "visual_hierarchy",
        level: "subtle",
        action: "Institutional slate hierarchy — no retail chrome",
      },
    ];
  }
}
