import type { DeskStateLabel } from "@/lib/daily/MarketStateClassificationEngine";

const HISTORY_KEY = "eq-market-state-history-v1";
const MAX_ENTRIES = 24;

export interface MarketStateHistoryEntry {
  at: number;
  state: DeskStateLabel;
  from: DeskStateLabel | null;
  confidence: number;
}

function load(): MarketStateHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MarketStateHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

function save(entries: MarketStateHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore */
  }
}

export const MarketStateHistoryEngine = {
  record(state: DeskStateLabel, confidence: number): MarketStateHistoryEntry[] {
    const prev = load();
    const last = prev[0];
    if (last && last.state === state && Date.now() - last.at < 60_000) return prev;

    const entry: MarketStateHistoryEntry = {
      at: Date.now(),
      state,
      from: last?.state ?? null,
      confidence,
    };
    const next = [entry, ...prev].slice(0, MAX_ENTRIES);
    save(next);
    return next;
  },

  recent(limit = 6): MarketStateHistoryEntry[] {
    return load().slice(0, limit);
  },
};
