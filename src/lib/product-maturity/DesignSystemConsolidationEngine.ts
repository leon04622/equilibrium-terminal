import {
  DENSITY_PRESETS,
  INSTITUTIONAL_INTERACTION,
  MODE_CHROME,
  TERMINAL_SPACING,
} from "@/lib/theme/institutional";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { MaturityTokenRow } from "@/types/product-maturity";

export class DesignSystemConsolidationEngine {
  static tokens(): MaturityTokenRow[] {
    const mode = useAdaptiveWorkspaceStore.getState().mode;
    const density = useTerminalExperienceStore.getState().density;
    const chrome = MODE_CHROME[mode];
    const preset = DENSITY_PRESETS[density];

    return [
      { id: "ds-density", domain: "spacing", token: "density", value: preset.label },
      { id: "ds-grid", domain: "spacing", token: "grid_row", value: `${preset.gridRowHeight}px` },
      { id: "ds-pad-md", domain: "spacing", token: "pad_md", value: `${TERMINAL_SPACING.md}px` },
      { id: "ds-mode", domain: "color", token: "mode_chrome", value: chrome.label },
      { id: "ds-accent", domain: "color", token: "mode_accent", value: chrome.accent },
      { id: "ds-tab", domain: "interaction", token: "tab_model", value: "institutional border tabs" },
      { id: "ds-panel", domain: "interaction", token: "panel_button", value: INSTITUTIONAL_INTERACTION.panelButton.slice(0, 32) },
      { id: "ds-input", domain: "interaction", token: "input", value: "mono · slate · cyan focus" },
    ];
  }
}
