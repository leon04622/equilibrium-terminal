import { IntelligenceIndex } from "@/lib/discovery/IntelligenceIndex";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { IntelligenceIndexEntry } from "@/types/information-discovery";

const WORKSPACE_MODES = [
  { id: "ws-execution", mode: "execution", label: "Execution desk workspace" },
  { id: "ws-research", mode: "research", label: "Research workspace" },
  { id: "ws-macro", mode: "macro", label: "Macro command workspace" },
  { id: "ws-surveillance", mode: "surveillance", label: "Surveillance workspace" },
];

/** Unified local index: assets, intel, commands, watchlists, workspaces. */
export class GlobalSearchIndex {
  static rebuild(): IntelligenceIndexEntry[] {
    const now = Date.now();
    const base = IntelligenceIndex.rebuild();
    const extra: IntelligenceIndexEntry[] = [];

    const watchlist = useInformationDiscoveryStore.getState().watchlist;
    for (const w of watchlist) {
      extra.push({
        id: `watch-${w.coin}`,
        category: "watchlist",
        coin: w.coin,
        title: w.coin,
        snippet: "Surveillance watchlist",
        timestamp: w.addedAt,
        relevanceBoost: 1.2,
        routeWidget: "surveillance",
        routeCoin: w.coin,
        keywords: ["watch", w.coin.toLowerCase()],
      });
    }

    const mode = useAdaptiveWorkspaceStore.getState().mode;
    extra.push({
      id: `workspace-current-${mode}`,
      category: "workspace",
      coin: null,
      title: `Workspace · ${mode.toUpperCase()}`,
      snippet: useWedgeStore.getState().deskFocusMode
        ? "HL execution desk (V1 wedge)"
        : "Full platform workspace",
      timestamp: now,
      relevanceBoost: 1.1,
      routeWidget: "chart",
      routeCoin: null,
      keywords: ["workspace", mode],
    });

    for (const ws of WORKSPACE_MODES) {
      extra.push({
        id: ws.id,
        category: "workspace",
        coin: null,
        title: ws.label,
        snippet: `/workspace [asset] ${ws.mode}`,
        timestamp: now,
        relevanceBoost: 1,
        routeWidget: "chart",
        routeCoin: null,
        keywords: ["workspace", ws.mode],
      });
    }

    const surv = useInformationDiscoveryStore.getState().surveillance;
    if (surv) {
      for (const h of surv.headlines.slice(0, 8)) {
        extra.push({
          id: `alert-${h.id}`,
          category: "alert",
          coin: h.coin ?? null,
          title: h.headline,
          snippet: `Regime ${surv.regime} · surveillance`,
          timestamp: h.timestamp,
          relevanceBoost: h.priority >= 8 ? 1.8 : 1.2,
          routeWidget: "surveillance",
          routeCoin: h.coin ?? null,
          keywords: ["alert", "monitor"],
        });
      }
    }

    return [...base, ...extra];
  }
}
