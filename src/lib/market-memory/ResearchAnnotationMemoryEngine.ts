import { DeskAnnotationEngine } from "@/lib/collaboration/DeskAnnotationEngine";
import type { ResearchMemoryEntry } from "@/types/market-memory";

const STORAGE_KEY = "eq-research-memory-v1";

function load(): ResearchMemoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResearchMemoryEntry[]) : [];
  } catch {
    return [];
  }
}

export class ResearchAnnotationMemoryEngine {
  static entries(asset: string): ResearchMemoryEntry[] {
    const upper = asset.toUpperCase();
    const desk = DeskAnnotationEngine.list();
    const fromDesk: ResearchMemoryEntry[] = desk
      .filter((a) => !a.coin || a.coin.toUpperCase() === upper)
      .map((a) => ({
        id: a.id,
        author: a.authorHandle,
        coin: a.coin ?? upper,
        label: a.label,
        body: a.body,
        timestamp: a.timestamp,
      }));

    const stored = load().filter((e) => e.coin.toUpperCase() === upper);
    return [...fromDesk, ...stored].sort((a, b) => b.timestamp - a.timestamp).slice(0, 16);
  }
}
