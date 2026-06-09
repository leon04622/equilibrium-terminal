import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { NarrativeEvolutionEngine } from "@/lib/market-memory/NarrativeEvolutionEngine";
import type { ThesisLifecycle } from "@/types/research-operating";

export class ThesisTrackingEngine {
  static theses(asset: string): ThesisLifecycle[] {
    const upper = asset.toUpperCase();
    const rows = useTraderWorkflowStore.getState().theses;
    const narratives = NarrativeEvolutionEngine.timeline(asset);
    const phase = narratives[0]?.phase ?? "general";

    return rows
      .filter((t) => t.coin.toUpperCase() === upper || !asset)
      .map((t) => ({
        id: t.id,
        coin: t.coin,
        thesis: t.thesis,
        invalidation: t.invalidation,
        status: t.status,
        hypothesisStatus: (t.status === "invalidated"
          ? "invalidated"
          : t.status === "closed"
            ? "confirmed"
            : "testing") as ThesisLifecycle["hypothesisStatus"],
        narrativePhase: phase,
        evidenceIds: [],
        updatedAt: t.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
