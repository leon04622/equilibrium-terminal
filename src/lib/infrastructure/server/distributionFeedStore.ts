import type { NewswireItem } from "@/types/information-distribution";

const feedCache: {
  events: NewswireItem[];
  updatedAt: number;
} = {
  events: [],
  updatedAt: 0,
};

export function syncDistributionFeed(events: NewswireItem[]): void {
  feedCache.events = events.slice(0, 64);
  feedCache.updatedAt = Date.now();
}

export function getDistributionFeed(limit = 32): {
  feedId: string;
  generatedAt: number;
  events: NewswireItem[];
} {
  return {
    feedId: "eq-terminal-wire-v1",
    generatedAt: feedCache.updatedAt || Date.now(),
    events: feedCache.events.slice(0, limit),
  };
}
