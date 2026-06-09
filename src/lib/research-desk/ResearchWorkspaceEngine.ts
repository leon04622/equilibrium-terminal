import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { ResearchCollection, ResearchNotebook } from "@/types/research-operating";

const COLLECTIONS_KEY = "eq-research-collections-v1";

function loadCollections(): ResearchCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    return raw ? (JSON.parse(raw) as ResearchCollection[]) : [];
  } catch {
    return [];
  }
}

export class ResearchWorkspaceEngine {
  static notebooks(asset: string): ResearchNotebook[] {
    const views = useTraderWorkflowStore.getState().savedViews;
    const fromViews: ResearchNotebook[] = views.map((v) => ({
      id: v.id,
      name: v.name,
      coin: v.coin,
      description: v.description,
      panelFocus: v.panelFocus,
      updatedAt: v.createdAt,
    }));

    const assetNotebook: ResearchNotebook = {
      id: `nb-${asset}`,
      name: `${asset} ANALYST VIEW`,
      coin: asset,
      description: "Chart · intel · memory · thesis",
      panelFocus: ["chart", "intelligence", "memorydesk", "researchdesk"],
      updatedAt: Date.now(),
    };

    return [assetNotebook, ...fromViews].slice(0, 12);
  }

  static collections(asset: string): ResearchCollection[] {
    const journal = useTraderWorkflowStore.getState().journal;
    const theses = useTraderWorkflowStore.getState().theses;
    const stored = loadCollections();
    if (stored.length) return stored;

    return [
      {
        id: "col-journal",
        title: "Market journal",
        coins: [asset],
        entryCount: journal.length,
        updatedAt: Date.now(),
      },
      {
        id: "col-thesis",
        title: "Thesis board",
        coins: theses.map((t) => t.coin),
        entryCount: theses.length,
        updatedAt: Date.now(),
      },
      {
        id: "col-cross",
        title: "Cross-asset research",
        coins: ["BTC", "ETH", asset],
        entryCount: journal.filter((j) => !j.coin || j.coin === asset).length,
        updatedAt: Date.now(),
      },
    ];
  }
}
