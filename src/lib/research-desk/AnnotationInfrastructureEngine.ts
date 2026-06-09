import { DeskAnnotationEngine } from "@/lib/collaboration/DeskAnnotationEngine";
import { researchAnnotationStore } from "@/lib/research-desk/researchAnnotationStore";
import type { AnnotationKind } from "@/types/collaboration";
import type { PersistedAnnotation } from "@/types/research-operating";

export class AnnotationInfrastructureEngine {
  static list(asset: string): PersistedAnnotation[] {
    const upper = asset.toUpperCase();
    const desk = DeskAnnotationEngine.list()
      .filter((a) => !a.coin || a.coin.toUpperCase() === upper)
      .map((a) => ({
        id: a.id,
        kind: a.kind,
        coin: a.coin,
        label: a.label,
        body: a.body,
        price: a.price,
        linkedEventId: null,
        timestamp: a.timestamp,
        pinned: a.pinned,
      }));

    const local = researchAnnotationStore.all().filter((a) => a.coin.toUpperCase() === upper);
    const merged = new Map<string, PersistedAnnotation>();
    for (const row of [...local, ...desk]) merged.set(row.id, row);
    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  static add(
    kind: AnnotationKind,
    coin: string,
    label: string,
    body: string,
    linkedEventId: string | null = null,
    price: number | null = null,
  ): PersistedAnnotation {
    const row: PersistedAnnotation = {
      id: `ann-${Date.now()}`,
      kind,
      coin: coin.toUpperCase(),
      label,
      body,
      price,
      linkedEventId,
      timestamp: Date.now(),
      pinned: false,
    };
    researchAnnotationStore.append(row);
    return row;
  }
}
