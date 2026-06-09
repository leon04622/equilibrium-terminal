import type { HistoricalEventRecord } from "@/types/market-memory";

const STORAGE_KEY = "eq-historical-events-v1";
const MAX_EVENTS = 500;

let cache: HistoricalEventRecord[] = [];

function load(): HistoricalEventRecord[] {
  if (cache.length) return cache;
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cache = JSON.parse(raw) as HistoricalEventRecord[];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache.slice(0, MAX_EVENTS)));
  } catch {
    /* quota */
  }
}

export const historicalEventArchive = {
  all(): HistoricalEventRecord[] {
    return load().sort((a, b) => b.timestamp - a.timestamp);
  },

  forAsset(asset: string): HistoricalEventRecord[] {
    const upper = asset.toUpperCase();
    return load().filter((e) => e.asset === upper || e.asset === "ALL");
  },

  append(event: HistoricalEventRecord): void {
    const list = load();
    if (list.some((e) => e.id === event.id)) return;
    list.unshift(event);
    cache = list.slice(0, MAX_EVENTS);
    persist();
  },

  search(query: string, asset?: string): HistoricalEventRecord[] {
    const q = query.toLowerCase().trim();
    let rows = asset ? this.forAsset(asset) : this.all();
    if (!q) return rows.slice(0, 32);
    return rows
      .filter(
        (e) =>
          e.headline.toLowerCase().includes(q) ||
          e.detail.toLowerCase().includes(q) ||
          e.kind.includes(q) ||
          e.tags.some((t) => t.includes(q)),
      )
      .slice(0, 32);
  },
};
