import { historicalEventArchive } from "@/lib/market-memory/historicalEventArchive";
import type { MemorySearchResult } from "@/types/market-memory";

export class HistoricalSearchEngine {
  static search(asset: string, query = ""): MemorySearchResult[] {
    const events = historicalEventArchive.search(query, asset);
    return events.map((event, i) => ({
      event,
      score: Math.max(10, 100 - i * 4 - (Date.now() - event.timestamp) / 86_400_000),
    }));
  }
}
