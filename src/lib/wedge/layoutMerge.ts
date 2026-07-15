import type { Layout } from "react-grid-layout";
import { WEDGE_CORE_PANEL_IDS } from "@/lib/wedge/WedgeManifest";

/** Add wedge-core panels (e.g. newswire) that were added after a layout was saved. */
export function mergeMissingCorePanels(saved: Layout[], canonical: Layout[]): Layout[] {
  const ids = new Set(saved.map((l) => l.i));
  const missing = canonical.filter((l) => !ids.has(l.i) && WEDGE_CORE_PANEL_IDS.has(l.i));
  if (!missing.length) return saved.map((l) => ({ ...l }));
  return [...saved.map((l) => ({ ...l })), ...missing.map((l) => ({ ...l }))];
}
