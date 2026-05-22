import { MODE_PANEL_WEIGHTS } from "@/lib/adaptive/PanelDefinitions";
import type {
  PanelPriorityScore,
  TerminalMode,
  WorkspaceContextSnapshot,
  WorkspacePanelId,
} from "@/types/adaptive-workspace";
import { ALL_WORKSPACE_PANEL_IDS } from "@/types/adaptive-workspace";
import type { LayoutFocusTrend } from "@/types/trader-telemetry";

/** Core trading panels must never disappear from the workspace. */
export const NEVER_HIDE_PANEL_IDS = new Set<string>([
  "macro",
  "chart",
  "hyperbook",
  "intelligence",
  "ticket",
  "positions",
]);

const REGIME_BOOST: Record<string, Partial<Record<WorkspacePanelId, number>>> = {
  liquidation: {
    domladder: 25,
    slippageradar: 22,
    hyperbook: 18,
    intelligence: 15,
    macro: -10,
    alphalab: -15,
  },
  compression: {
    alphalab: 20,
    copilot: 15,
    macro: 12,
    domladder: -12,
  },
  "risk-off": {
    macro: 18,
    intelligence: 12,
    alerts: 10,
  },
  "risk-on": {
    chart: 12,
    hyperbook: 10,
    ticket: 8,
  },
};

const WORKFLOW_BOOST: Record<
  WorkspaceContextSnapshot["workflowPhase"],
  Partial<Record<WorkspacePanelId, number>>
> = {
  executing: {
    ticket: 30,
    domladder: 28,
    slippageradar: 26,
    positions: 20,
    macro: -20,
    alphalab: -18,
  },
  analyzing: {
    chart: 18,
    intelligence: 16,
    copilot: 14,
    alphalab: 12,
  },
  observing: {
    macro: 15,
    intelligence: 12,
    proactive: 10,
  },
  reviewing: {
    diagnostics: 20,
    alerts: 15,
    positions: 12,
  },
  idle: {},
};

function affinityFromTrends(
  panelId: string,
  trends: LayoutFocusTrend[],
): number {
  const trend = trends.find((t) => t.panelId === panelId);
  if (!trend) return 20;
  const dwellMin = trend.totalDwellMs / 60_000;
  return Math.min(100, Math.round(25 + dwellMin * 12));
}

function urgencyFromContext(
  panelId: WorkspacePanelId,
  ctx: WorkspaceContextSnapshot,
): number {
  let u = 30;
  if (panelId === "domladder" || panelId === "slippageradar") {
    u += ctx.volatilityScore * 0.35;
    if (ctx.slippageRiskTier === "critical") u += 40;
    else if (ctx.slippageRiskTier === "high") u += 25;
  }
  if (panelId === "ticket" || panelId === "positions") {
    if (ctx.executionState !== "flat") u += 35;
    if (ctx.orderPending) u += 25;
  }
  if (panelId === "alerts") u += ctx.alertPressure * 0.4;
  if (panelId === "macro" && ctx.marketRegime !== "neutral") u += 15;
  if (panelId === "intelligence" && ctx.marketRegime === "liquidation") u += 30;
  return Math.min(100, Math.round(u));
}

function activityFromContext(
  panelId: WorkspacePanelId,
  ctx: WorkspaceContextSnapshot,
): number {
  if (ctx.focusPanelId === panelId) return 95;
  if (panelId === "chart" && ctx.workflowPhase === "analyzing") return 75;
  if (panelId === "copilot" && ctx.workflowPhase === "reviewing") return 70;
  return 40;
}

/**
 * Scores each workspace panel for relevance, urgency, activity, and affinity.
 */
export class PanelPriorityEngine {
  static scoreAll(
    mode: TerminalMode,
    ctx: WorkspaceContextSnapshot,
    focusTrends: LayoutFocusTrend[],
  ): PanelPriorityScore[] {
    const weights = MODE_PANEL_WEIGHTS[mode];
    const regimePatch = REGIME_BOOST[ctx.marketRegime] ?? {};
    const workflowPatch = WORKFLOW_BOOST[ctx.workflowPhase] ?? {};

    const raw = ALL_WORKSPACE_PANEL_IDS.map((panelId) => {
      const relevance = Math.min(
        100,
        Math.max(
          0,
          (weights[panelId] ?? 50) +
            (regimePatch[panelId] ?? 0) +
            (workflowPatch[panelId] ?? 0),
        ),
      );
      const urgency = urgencyFromContext(panelId, ctx);
      const activity = activityFromContext(panelId, ctx);
      const affinity = affinityFromTrends(panelId, focusTrends);

      const composite = Math.round(
        relevance * 0.38 + urgency * 0.28 + activity * 0.18 + affinity * 0.16,
      );

      return { panelId, relevance, urgency, activity, affinity, composite };
    });

    const sorted = [...raw].sort((a, b) => b.composite - a.composite);
    const collapseThreshold = 28;
    const hideThreshold = 18;
    const emphasizeThreshold = 72;

    return raw.map((row) => {
      const rank = sorted.findIndex((s) => s.panelId === row.panelId);
      const bottomQuartile = rank >= Math.floor(sorted.length * 0.75);
      const hide =
        !NEVER_HIDE_PANEL_IDS.has(row.panelId) &&
        row.composite < hideThreshold &&
        bottomQuartile;
      return {
        ...row,
        emphasize: row.composite >= emphasizeThreshold,
        collapse:
          !NEVER_HIDE_PANEL_IDS.has(row.panelId) &&
          (row.composite < collapseThreshold ||
            (bottomQuartile && row.composite < 40)),
        hide,
      };
    });
  }
}
