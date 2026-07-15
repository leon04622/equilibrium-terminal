import type { Layout } from "react-grid-layout";

/** Panel ids currently on the workspace grid. */
export function layoutPanelIds(layout: Layout[]): Set<string> {
  return new Set(layout.map((l) => l.i));
}

/** Enable background hooks only when a matching panel is on the grid. */
export function panelHookEnabled(
  layout: Layout[],
  _deskFocusMode: boolean,
  panelIds: string | string[],
): boolean {
  const ids = Array.isArray(panelIds) ? panelIds : [panelIds];
  const onGrid = layoutPanelIds(layout);
  return ids.some((id) => onGrid.has(id));
}
