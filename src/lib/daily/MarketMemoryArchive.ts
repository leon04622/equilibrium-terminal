import type { MarketMemoryEntry } from "@/types/daily-operations";
import type { DailyOperationsSnapshot } from "@/types/daily-operations";

const STORAGE_KEY = "eq-market-memory-v1";
const MAX_ENTRIES = 14;

export class MarketMemoryArchive {
  static load(): MarketMemoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as MarketMemoryEntry[];
    } catch {
      return [];
    }
  }

  static save(entries: MarketMemoryEntry[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    } catch {
      /* quota */
    }
  }

  static appendFromSnapshot(snapshot: Pick<DailyOperationsSnapshot, "clock" | "briefing" | "marketState">): MarketMemoryEntry[] {
    const prev = MarketMemoryArchive.load();
    const entry: MarketMemoryEntry = {
      id: `mem-${Date.now().toString(36)}`,
      session: snapshot.clock.activeSession,
      savedAt: Date.now(),
      summary: snapshot.briefing.headline,
      regime: snapshot.marketState.regime,
      stressScore: snapshot.briefing.alertPressure,
      topMovers: snapshot.briefing.bullets
        .filter((b) => b.category === "narrative")
        .slice(0, 3)
        .map((b) => b.headline),
    };
    const next = [entry, ...prev.filter((e) => Date.now() - e.savedAt > 60_000)].slice(0, MAX_ENTRIES);
    MarketMemoryArchive.save(next);
    return next;
  }
}
