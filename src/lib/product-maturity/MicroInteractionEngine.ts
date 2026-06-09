import { INSTITUTIONAL_INTERACTION, TRANSITION_CALM } from "@/lib/theme/institutional";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { MicroInteractionRow } from "@/types/product-maturity";

export class MicroInteractionEngine {
  static surfaces(): MicroInteractionRow[] {
    const reduced = useTerminalExperienceStore.getState().reducedMotion;

    return [
      { id: "mi-hover", surface: "panel_controls", behavior: "slate hover · no glow gimmicks" },
      { id: "mi-tab", surface: "desk_tabs", behavior: INSTITUTIONAL_INTERACTION.tabIdle },
      { id: "mi-focus", surface: "keyboard_focus", behavior: "cyan outline · visible focus ring" },
      {
        id: "mi-transition",
        surface: "panel_chrome",
        behavior: reduced ? "motion off" : TRANSITION_CALM.panel,
      },
      { id: "mi-load", surface: "loading", behavior: "skeleton · no retail spinner flash" },
      { id: "mi-tooltip", surface: "context", behavior: "title attr · operational microcopy" },
    ];
  }
}
