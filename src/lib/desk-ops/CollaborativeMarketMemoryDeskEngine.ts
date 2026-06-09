import { OrganizationalMemoryEngine } from "@/lib/collaboration/OrganizationalMemoryEngine";
import type { CollabMemoryRow } from "@/types/desk-operations";

export class CollaborativeMarketMemoryDeskEngine {
  static archive(asset: string): CollabMemoryRow[] {
    const upper = asset.toUpperCase();
    return OrganizationalMemoryEngine.archive()
      .filter((m) => !upper || !m.coin || m.coin.toUpperCase() === upper)
      .map((m) => ({
        id: m.id,
        kind: m.kind,
        title: m.title,
        author: m.authorHandle,
        archivedAt: m.archivedAt,
      }));
  }
}
