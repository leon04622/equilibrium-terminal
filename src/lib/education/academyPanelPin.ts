import type { Layout } from "react-grid-layout";
import { FULL_WORKSPACE_LAYOUT, WEDGE_ADVANCED_LAYOUT_APPEND } from "@/lib/wedge/WedgeManifest";

const LAYOUT_BY_ID = new Map<string, Layout>();
for (const item of [...FULL_WORKSPACE_LAYOUT, ...WEDGE_ADVANCED_LAYOUT_APPEND]) {
  if (!LAYOUT_BY_ID.has(item.i)) LAYOUT_BY_ID.set(item.i, item);
}

/** Large readable slot when a live bridge pins a panel into the workspace. */
export function academyPanelPinLayout(panelId: string): Layout {
  const base = LAYOUT_BY_ID.get(panelId);
  return {
    i: panelId,
    x: 0,
    y: 0,
    w: 12,
    h: base?.h ?? 12,
    minW: base?.minW ?? 6,
    minH: base?.minH ?? 6,
  };
}

export function isAcademyHeaderTarget(panelId: string): boolean {
  return panelId === "header-strip";
}
