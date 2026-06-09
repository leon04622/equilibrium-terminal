import { DENSITY_PRESETS } from "@/lib/theme/institutional";
import { OperationalImmersionDeskEngine } from "@/lib/unified-ops/OperationalImmersionDeskEngine";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { ErgonomicsRow } from "@/types/product-maturity";

export class TerminalErgonomicsEngine {
  static profile(): ErgonomicsRow[] {
    const exp = useTerminalExperienceStore.getState();
    const preset = DENSITY_PRESETS[exp.density];
    const immersion = OperationalImmersionDeskEngine.commands();

    return [
      {
        id: "erg-density",
        control: "information_density",
        state: preset.label,
        recommendation: exp.density === "compact" ? "High density — monitor fatigue" : "Balanced for 8h+ sessions",
      },
      {
        id: "erg-grid",
        control: "panel_row_height",
        state: `${preset.gridRowHeight}px`,
        recommendation: "Aligns grid with typography scale",
      },
      {
        id: "erg-calm",
        control: "operational_calm",
        state: exp.calmMode ? "on" : "off",
        recommendation: exp.calmMode ? "Reduced visual noise" : "Enable for long sessions",
      },
      {
        id: "erg-motion",
        control: "reduced_motion",
        state: exp.reducedMotion ? "on" : "off",
        recommendation: "Suppresses flash and pulse animations",
      },
      ...immersion.slice(0, 3).map((c) => ({
        id: c.id,
        control: c.command,
        state: "bound",
        recommendation: c.description,
      })),
    ];
  }
}
