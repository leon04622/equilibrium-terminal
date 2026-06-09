import { DENSITY_PRESETS } from "@/lib/theme/institutional";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { DesignSystemRow } from "@/types/unified-operations";

export class InstitutionalDesignDeskEngine {
  static tokens(): DesignSystemRow[] {
    const exp = useTerminalExperienceStore.getState();
    const density = DENSITY_PRESETS[exp.density];

    return [
      { id: "ds-density", token: "density", value: density.label },
      { id: "ds-calm", token: "calm_mode", value: exp.calmMode ? "on" : "off" },
      { id: "ds-motion", token: "reduced_motion", value: exp.reducedMotion ? "on" : "off" },
      { id: "ds-type", token: "typography", value: "institutional mono" },
      { id: "ds-hierarchy", token: "panel_hierarchy", value: "stream → intel → desk" },
      { id: "ds-load", token: "loading", value: "skeleton · no retail flash" },
    ];
  }
}
