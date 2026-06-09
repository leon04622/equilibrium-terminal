import { DeskAnnotationEngine } from "@/lib/collaboration/DeskAnnotationEngine";
import { TeamCommunicationEngine } from "@/lib/collaboration/TeamCommunicationEngine";
import type { SharedIntelRow } from "@/types/desk-operations";

export class SharedIntelligenceDeskEngine {
  static feed(asset: string): SharedIntelRow[] {
    const upper = asset.toUpperCase();
    const comms = TeamCommunicationEngine.feed()
      .filter((c) => !upper || !c.coin || c.coin.toUpperCase() === upper)
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        kind: c.kind,
        headline: c.headline,
        author: c.authorHandle,
        severity: c.severity,
        coin: c.coin,
      }));

    const notes = DeskAnnotationEngine.list()
      .filter((a) => !upper || a.coin.toUpperCase() === upper)
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        kind: `annotation:${a.kind}`,
        headline: a.label,
        author: a.authorHandle,
        severity: a.pinned ? "watch" : "info",
        coin: a.coin,
      }));

    return [...comms, ...notes].sort((a, b) => 0);
  }
}
