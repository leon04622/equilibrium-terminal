import type { Layout } from "react-grid-layout";
import { WEDGE_CORE_PANEL_IDS } from "@/lib/wedge/WedgeManifest";

/** Bump when the execution ticket slot must replace persisted tiny Bloomberg strips. */
export const DESK_LAYOUT_EPOCH = "hl-ticket-dock-v1";
export const DESK_LAYOUT_EPOCH_KEY = "eq-layout-epoch";

/** Add wedge-core panels (e.g. newswire) that were added after a layout was saved. */
export function mergeMissingCorePanels(saved: Layout[], canonical: Layout[]): Layout[] {
  const ids = new Set(saved.map((l) => l.i));
  const missing = canonical.filter((l) => !ids.has(l.i) && WEDGE_CORE_PANEL_IDS.has(l.i));
  if (!missing.length) return saved.map((l) => ({ ...l }));
  return [...saved.map((l) => ({ ...l })), ...missing.map((l) => ({ ...l }))];
}

/**
 * Execution desk docks the ticket outside the grid. Drop stale ticket cells
 * from saved layouts so they cannot stretch into a Bloomberg strip.
 */
export function ensureTicketRail(saved: Layout[], canonical: Layout[]): Layout[] {
  const want = canonical.find((l) => l.i === "ticket");
  if (!want) return saved.filter((l) => l.i !== "ticket").map((l) => ({ ...l }));
  const minH = want.minH ?? want.h;
  const minW = want.minW ?? want.w;
  let found = false;
  const next = saved.map((l) => {
    if (l.i !== "ticket") return { ...l };
    found = true;
    const tooSmall = l.h < minH || l.w < minW;
    const wrongSlot = l.x !== want.x;
    if (tooSmall || wrongSlot) return { ...want };
    return {
      ...l,
      minH: Math.max(l.minH ?? 0, minH),
      minW: Math.max(l.minW ?? 0, minW),
    };
  });
  if (!found) next.push({ ...want });
  return next;
}
