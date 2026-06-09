import { ResearchDistributionEngine } from "@/lib/collaboration/ResearchDistributionEngine";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { CollabResearchRow } from "@/types/desk-operations";

export class CollaborativeResearchDeskEngine {
  static publications(asset: string): CollabResearchRow[] {
    const upper = asset.toUpperCase();
    const pubs = ResearchDistributionEngine.publications()
      .filter((p) => !upper || p.coins.some((c) => c.toUpperCase() === upper))
      .map((p) => ({
        id: p.id,
        title: p.title,
        kind: p.kind,
        author: p.authorHandle,
        version: p.version,
        visibility: p.visibility,
      }));

    const theses = useTraderWorkflowStore
      .getState()
      .theses.filter((t) => !upper || t.coin.toUpperCase() === upper)
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        title: t.thesis.slice(0, 48),
        kind: "desk_thesis",
        author: "desk",
        version: 1,
        visibility: "team",
      }));

    return [...pubs, ...theses];
  }
}
