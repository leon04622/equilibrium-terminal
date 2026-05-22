import { applyFocusPreset, applyModePreset } from "@/lib/adaptive/ModePresets";
import { PanelPriorityEngine } from "@/lib/adaptive/PanelPriorityEngine";
import { WorkspaceContextEngine } from "@/lib/adaptive/WorkspaceContextEngine";
import { AttentionGovernor } from "@/lib/adaptive/AttentionGovernor";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import type {
  FocusMode,
  LayoutOrchestrationResult,
  PanelPriorityScore,
  TerminalMode,
} from "@/types/adaptive-workspace";
import type { Layout } from "react-grid-layout";

function clone(layout: Layout[]): Layout[] {
  return layout.map((item) => ({ ...item }));
}

function scaleHeight(base: number, composite: number, minH: number): number {
  const factor = 0.65 + (composite / 100) * 0.7;
  return Math.max(minH, Math.round(base * factor));
}

/**
 * Context-aware layout orchestration — resizes, collapses, and deprioritizes panels.
 */
export class LayoutOrchestrator {
  static orchestrate(
    baseLayout: Layout[],
    mode: TerminalMode,
    focusMode: FocusMode,
    options?: { respectFocus?: boolean },
  ): LayoutOrchestrationResult {
    const ctx = WorkspaceContextEngine.build();
    const trends = useTraderTelemetryStore.getState().layoutFocusTrends;
    const scores = PanelPriorityEngine.scoreAll(mode, ctx, trends);
    const cognitive = AttentionGovernor.evaluate(
      ctx,
      useTraderTelemetryStore.getState().metrics,
      baseLayout.length,
    );

    let layout =
      focusMode !== "none" && options?.respectFocus !== false
        ? applyFocusPreset(baseLayout, focusMode)
        : applyModePreset(baseLayout, mode);

    const scoreMap = new Map(scores.map((s) => [s.panelId, s]));
    const collapsedPanelIds: string[] = [];
    const hiddenPanelIds: string[] = [];
    const maxY = Math.max(...layout.map((l) => l.y + l.h), 0);

    layout = layout.map((item) => {
      const score = scoreMap.get(item.i);
      if (!score) return item;

      if (score.hide) {
        hiddenPanelIds.push(item.i);
        return {
          ...item,
          y: maxY + 2,
          h: 1,
          minH: 1,
          static: true,
        };
      }

      const minH = item.minH ?? 4;
      let h = scaleHeight(item.h, score.composite, minH);

      if (score.collapse) {
        collapsedPanelIds.push(item.i);
        h = Math.max(minH, 3);
      }

      if (score.emphasize) {
        h = Math.min(24, Math.round(h * 1.15));
      }

      return { ...item, h };
    });

    const reason = [
      `mode=${mode}`,
      focusMode !== "none" ? `focus=${focusMode}` : null,
      `regime=${ctx.marketRegime}`,
      `vol=${ctx.volatilityScore}`,
      cognitive.overloadRisk > 0.5 ? "cognitive-guard" : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      layout,
      mode,
      focusMode,
      scores,
      collapsedPanelIds,
      hiddenPanelIds,
      reason,
      appliedAt: Date.now(),
    };
  }

  static emphasisMap(scores: PanelPriorityScore[]): Record<string, "high" | "medium" | "low" | "muted"> {
    const map: Record<string, "high" | "medium" | "low" | "muted"> = {};
    for (const s of scores) {
      if (s.hide || s.collapse) map[s.panelId] = "muted";
      else if (s.emphasize) map[s.panelId] = "high";
      else if (s.composite >= 55) map[s.panelId] = "medium";
      else if (s.composite >= 35) map[s.panelId] = "low";
      else map[s.panelId] = "muted";
    }
    return map;
  }
}
