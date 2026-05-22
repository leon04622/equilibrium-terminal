import type { Layout } from "react-grid-layout";
import type {
  AdaptiveLayoutSuggestion,
  TraderInteractionEvent,
  TraderSegment,
} from "@/types/trader-telemetry";

export interface PanelVelocity {
  panelId: string;
  eventCount: number;
  lastAt: number;
  velocityPerMin: number;
}

const VELOCITY_WINDOW_MS = 120_000;

function cloneLayout(layout: Layout[]): Layout[] {
  return layout.map((item) => ({ ...item }));
}

function bumpPanel(
  layout: Layout[],
  panelId: string,
  patch: Partial<Layout>,
): Layout[] {
  return layout.map((item) =>
    item.i === panelId ? { ...item, ...patch } : item,
  );
}

function promoteIntelligenceWire(layout: Layout[]): Layout[] {
  let next = bumpPanel(layout, "intelligence", { y: 3, h: 10, w: 3 });
  next = bumpPanel(next, "hyperbook", { y: 3, w: 3, h: 12 });
  next = bumpPanel(next, "chart", { x: 3, y: 3, w: 6, h: 12 });
  return next;
}

function promoteHyperBook(layout: Layout[]): Layout[] {
  let next = bumpPanel(layout, "hyperbook", { x: 0, y: 3, w: 5, h: 16 });
  next = bumpPanel(next, "chart", { x: 5, y: 3, w: 4, h: 14 });
  next = bumpPanel(next, "intelligence", { x: 9, y: 3, w: 3, h: 6 });
  return next;
}

function analystLayout(layout: Layout[]): Layout[] {
  let next = bumpPanel(layout, "copilot", { y: 11, h: 4 });
  next = bumpPanel(next, "proactive", { y: 15, h: 4 });
  next = bumpPanel(next, "alerts", { y: 20, w: 12, h: 6 });
  return next;
}

function passiveLayout(layout: Layout[]): Layout[] {
  return bumpPanel(layout, "macro", { h: 4, w: 12 });
}

/**
 * Adaptive workspace optimizer — layout patches from interaction velocity.
 */
export class AdaptiveOptimizer {
  private static instance: AdaptiveOptimizer | null = null;

  private velocities = new Map<string, PanelVelocity>();
  private lastSuggestion: AdaptiveLayoutSuggestion | null = null;
  private baseLayout: Layout[] | null = null;

  static getInstance(): AdaptiveOptimizer {
    if (!AdaptiveOptimizer.instance) {
      AdaptiveOptimizer.instance = new AdaptiveOptimizer();
    }
    return AdaptiveOptimizer.instance;
  }

  setBaseLayout(layout: Layout[]): void {
    this.baseLayout = cloneLayout(layout);
  }

  getLastSuggestion(): AdaptiveLayoutSuggestion | null {
    return this.lastSuggestion;
  }

  ingestBatch(
    events: TraderInteractionEvent[],
    segment: TraderSegment,
  ): AdaptiveLayoutSuggestion | null {
    const now = Date.now();
    for (const ev of events) {
      const panelId = ev.panelId ?? this.panelFromKind(ev.kind);
      if (!panelId) continue;
      const prev = this.velocities.get(panelId);
      const eventCount = (prev?.eventCount ?? 0) + 1;
      const elapsedMin = prev
        ? Math.max(0.05, (now - (prev.lastAt - VELOCITY_WINDOW_MS)) / 60_000)
        : 1;
      this.velocities.set(panelId, {
        panelId,
        eventCount,
        lastAt: now,
        velocityPerMin: eventCount / elapsedMin,
      });
    }

    this.velocities.forEach((v, id) => {
      if (now - v.lastAt > VELOCITY_WINDOW_MS) {
        this.velocities.delete(id);
      }
    });

    return this.evaluateFromVelocity(segment, now);
  }

  evaluateForSegment(
    segment: TraderSegment,
    now = Date.now(),
  ): AdaptiveLayoutSuggestion | null {
    if (!this.baseLayout) return null;

    const ranked = Array.from(this.velocities.values()).sort(
      (a, b) => b.velocityPerMin - a.velocityPerMin,
    );
    const top = ranked[0];
    const second = ranked[1];

    let layout = cloneLayout(this.baseLayout);
    let reason = "BASELINE";

    if (segment === "scalper" || (top?.panelId === "hyperbook" && top.velocityPerMin >= 12)) {
      layout = promoteHyperBook(layout);
      reason = "SCALP VELOCITY · HYPERBOOK PRIORITY";
    } else if (
      segment === "analyst" ||
      top?.panelId === "intelligence" ||
      top?.panelId === "copilot"
    ) {
      layout = promoteIntelligenceWire(layout);
      reason = "ANALYST FLOW · INTEL WIRE FORWARD";
    } else if (segment === "swing" && second?.panelId === "chart") {
      layout = bumpPanel(layout, "chart", { w: 7, h: 15 });
      reason = "SWING FLOW · CHART EXPAND";
    } else if (segment === "passive") {
      layout = passiveLayout(layout);
      reason = "PASSIVE SESSION · MACRO EMPHASIS";
    } else if (top && top.velocityPerMin >= 8) {
      if (top.panelId === "hyperbook") {
        layout = promoteHyperBook(layout);
        reason = `VELOCITY ${top.velocityPerMin.toFixed(1)}/m · BOOK`;
      } else if (top.panelId === "intelligence" || top.panelId === "alerts") {
        layout = promoteIntelligenceWire(layout);
        reason = `VELOCITY ${top.velocityPerMin.toFixed(1)}/m · INTEL`;
      }
    } else {
      return this.lastSuggestion;
    }

    const suggestion: AdaptiveLayoutSuggestion = {
      layout,
      reason,
      segment,
      appliedAt: null,
    };
    this.lastSuggestion = suggestion;
    return suggestion;
  }

  private panelFromKind(kind: TraderInteractionEvent["kind"]): string | null {
    switch (kind) {
      case "click":
      case "widget_focus":
      case "panel_maximize":
        return null;
      case "asset_focus":
        return "chart";
      case "layout_change":
        return "workspace";
      case "omnibar_command":
        return "copilot";
      case "alert_view":
      case "alert_bypass":
        return "alerts";
      case "intel_wire":
        return "intelligence";
      default:
        return null;
    }
  }

  private evaluateFromVelocity(
    segment: TraderSegment,
    now: number,
  ): AdaptiveLayoutSuggestion | null {
    const ranked = Array.from(this.velocities.values()).sort(
      (a, b) => b.velocityPerMin - a.velocityPerMin,
    );
    if (ranked.length === 0) return this.lastSuggestion;
    const top = ranked[0];
    if (top.velocityPerMin < 4 && segment === "unknown") {
      return this.lastSuggestion;
    }

    let resolved: TraderSegment = segment;
    if (segment === "unknown") {
      if (top.panelId === "hyperbook" && top.velocityPerMin >= 12) {
        resolved = "scalper";
      } else if (top.panelId === "intelligence" || top.panelId === "copilot") {
        resolved = "analyst";
      } else if (top.panelId === "chart") {
        resolved = "swing";
      }
    }

    return this.evaluateForSegment(resolved, now);
  }
}

export const adaptiveOptimizer = AdaptiveOptimizer.getInstance();
