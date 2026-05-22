import type {
  DiscoverySearchResult,
  IntelligenceIndexEntry,
} from "@/types/information-discovery";

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 1);
}

export class InformationDiscoveryEngine {
  static search(
    index: IntelligenceIndexEntry[],
    query: string,
    limit = 24,
  ): DiscoverySearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return index
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .map((entry) => ({ entry, score: entry.relevanceBoost }));
    }

    const tokens = tokenize(q);
    const scored: DiscoverySearchResult[] = [];

    for (const entry of index) {
      let score = 0;
      const title = entry.title.toLowerCase();
      const snippet = entry.snippet.toLowerCase();
      const coin = entry.coin?.toLowerCase() ?? "";

      if (title === q || coin === q) score += 100;
      if (title.startsWith(q)) score += 40;
      if (coin.startsWith(q)) score += 35;

      for (const t of tokens) {
        if (title.includes(t)) score += 12;
        if (snippet.includes(t)) score += 6;
        if (coin.includes(t)) score += 15;
        if (entry.keywords.some((k) => k.includes(t))) score += 8;
      }

      score *= entry.relevanceBoost;
      if (entry.category === "asset" && tokens.length === 1) score *= 1.1;

      if (score > 0) scored.push({ entry, score });
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
