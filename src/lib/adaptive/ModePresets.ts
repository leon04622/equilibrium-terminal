import type { Layout } from "react-grid-layout";
import type { FocusMode, TerminalMode } from "@/types/adaptive-workspace";

function clone(layout: Layout[]): Layout[] {
  return layout.map((item) => ({ ...item }));
}

function patch(
  layout: Layout[],
  panelId: string,
  p: Partial<Layout>,
): Layout[] {
  return layout.map((item) => (item.i === panelId ? { ...item, ...p } : item));
}

/** Mode-specific layout seeds applied before priority-based resizing. */
export function applyModePreset(layout: Layout[], mode: TerminalMode): Layout[] {
  let next = clone(layout);
  switch (mode) {
    case "execution":
      next = patch(next, "domladder", { x: 0, y: 3, w: 4, h: 14 });
      next = patch(next, "slippageradar", { x: 4, y: 3, w: 4, h: 10 });
      next = patch(next, "hyperbook", { x: 8, y: 3, w: 4, h: 14 });
      next = patch(next, "ticket", { x: 0, y: 17, w: 4, h: 10 });
      next = patch(next, "macro", { h: 2, w: 12 });
      break;
    case "macro":
      next = patch(next, "macro", { x: 0, y: 0, w: 12, h: 5 });
      next = patch(next, "intelligence", { x: 0, y: 5, w: 6, h: 12 });
      next = patch(next, "chart", { x: 6, y: 5, w: 6, h: 12 });
      break;
    case "research":
    case "quant":
      next = patch(next, "alphalab", { x: 0, y: 24, w: 8, h: 10 });
      next = patch(next, "chart", { x: 0, y: 3, w: 8, h: 14 });
      next = patch(next, "copilot", { x: 8, y: 3, w: 4, h: 8 });
      break;
    case "ai_analyst":
      next = patch(next, "copilot", { x: 0, y: 3, w: 6, h: 12 });
      next = patch(next, "proactive", { x: 6, y: 3, w: 6, h: 12 });
      next = patch(next, "intelligence", { x: 0, y: 15, w: 12, h: 8 });
      break;
    case "narrative":
      next = patch(next, "intelligence", { x: 0, y: 3, w: 8, h: 14 });
      next = patch(next, "proactive", { x: 8, y: 3, w: 4, h: 10 });
      break;
    case "scalping":
      next = patch(next, "hyperbook", { x: 0, y: 3, w: 5, h: 16 });
      next = patch(next, "chart", { x: 5, y: 3, w: 4, h: 14 });
      next = patch(next, "domladder", { x: 9, y: 3, w: 3, h: 16 });
      break;
    case "portfolio":
      next = patch(next, "positions", { x: 0, y: 3, w: 8, h: 14 });
      next = patch(next, "ticket", { x: 8, y: 3, w: 4, h: 10 });
      break;
    default:
      break;
  }
  return next;
}

/** Focus modes — deep-work layout overrides. */
export function applyFocusPreset(layout: Layout[], focus: FocusMode): Layout[] {
  if (focus === "none") return clone(layout);
  let next = clone(layout);
  switch (focus) {
    case "execution_deep":
      next = patch(next, "domladder", { x: 0, y: 0, w: 6, h: 22 });
      next = patch(next, "slippageradar", { x: 6, y: 0, w: 6, h: 10 });
      next = patch(next, "ticket", { x: 6, y: 10, w: 6, h: 12 });
      break;
    case "chart_isolated":
      next = patch(next, "chart", { x: 0, y: 0, w: 12, h: 24 });
      break;
    case "ai_briefing":
      next = patch(next, "copilot", { x: 0, y: 0, w: 8, h: 24 });
      next = patch(next, "proactive", { x: 8, y: 0, w: 4, h: 24 });
      break;
    case "macro_command":
      next = patch(next, "macro", { x: 0, y: 0, w: 12, h: 8 });
      next = patch(next, "intelligence", { x: 0, y: 8, w: 12, h: 16 });
      break;
    case "asset_war_room":
      next = patch(next, "chart", { x: 0, y: 0, w: 8, h: 14 });
      next = patch(next, "hyperbook", { x: 8, y: 0, w: 4, h: 14 });
      next = patch(next, "intelligence", { x: 0, y: 14, w: 12, h: 10 });
      break;
    default:
      break;
  }
  return next;
}
