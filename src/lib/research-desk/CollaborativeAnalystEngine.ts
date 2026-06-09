import { useCollaborationStore } from "@/store/useCollaborationStore";
import type { DeskCommentaryRow } from "@/types/research-operating";

export class CollaborativeAnalystEngine {
  static commentary(asset: string): DeskCommentaryRow[] {
    const snap = useCollaborationStore.getState().snapshot;
    if (!snap) return [];

    const upper = asset.toUpperCase();
    return snap.communications
      .filter((c) => !c.coin || c.coin.toUpperCase() === upper)
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        author: c.authorHandle,
        headline: c.headline,
        body: c.body,
        coin: c.coin,
        timestamp: c.timestamp,
      }));
  }
}
