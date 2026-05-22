import type { NewswireItem, SyndicationFeedMeta } from "@/types/information-distribution";

const publishLog: number[] = [];

/**
 * Prepares syndication payloads for institutional APIs and embeddable feeds.
 */
export class ExternalDistributionEngine {
  static meta(newswire: NewswireItem[]): SyndicationFeedMeta {
    const now = Date.now();
    publishLog.push(now);
    while (publishLog.length > 0 && now - publishLog[0] > 60_000) {
      publishLog.shift();
    }

    return {
      feedId: "eq-terminal-wire-v1",
      format: "json",
      eventsPerMinute: publishLog.length,
      lastPublishedAt: newswire[0]?.timestamp ?? now,
      subscriberReady: true,
    };
  }

  static exportFeed(newswire: NewswireItem[], limit = 32): {
    feedId: string;
    generatedAt: number;
    events: Array<{
      id: string;
      category: string;
      headline: string;
      detail: string;
      coin: string | null;
      severity: string;
      score: number;
      confidence: number;
      verified: boolean;
      timestamp: number;
    }>;
  } {
    return {
      feedId: "eq-terminal-wire-v1",
      generatedAt: Date.now(),
      events: newswire.slice(0, limit).map((e) => ({
        id: e.id,
        category: e.category,
        headline: e.headline,
        detail: e.detail,
        coin: e.coin,
        severity: e.severity,
        score: e.compositeScore,
        confidence: e.confidence,
        verified: e.verified,
        timestamp: e.timestamp,
      })),
    };
  }
}
