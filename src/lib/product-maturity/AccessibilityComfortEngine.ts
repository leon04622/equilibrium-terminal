import { DENSITY_PRESETS } from "@/lib/theme/institutional";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { AccessibilityRow } from "@/types/product-maturity";

export class AccessibilityComfortEngine {
  static comfort(): AccessibilityRow[] {
    const exp = useTerminalExperienceStore.getState();
    const preset = DENSITY_PRESETS[exp.density];

    return [
      {
        id: "a11y-contrast",
        control: "contrast",
        status: "slate-950 / slate-200",
        comfort: "WCAG-oriented institutional palette",
      },
      {
        id: "a11y-type",
        control: "typography",
        status: "mono · tabular nums",
        comfort: `${preset.rowH}px row rhythm`,
      },
      {
        id: "a11y-motion",
        control: "motion",
        status: exp.reducedMotion ? "reduced" : "standard",
        comfort: "Respects prefers-reduced-motion",
      },
      {
        id: "a11y-focus",
        control: "keyboard",
        status: "focus-visible",
        comfort: "OmniBar ⌘K · panel focus bus",
      },
      {
        id: "a11y-density",
        control: "scalable_density",
        status: preset.label,
        comfort: "Compact / standard / comfortable",
      },
    ];
  }
}
