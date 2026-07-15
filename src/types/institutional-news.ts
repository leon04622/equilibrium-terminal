/** Institutional multi-source news wire — server + client shared types. */

export type NewsSourceTier = "squawk" | "regulatory" | "macro" | "exchange" | "crypto" | "hl";

export interface InstitutionalNewsHeadline {
  id: string;
  headline: string;
  detail: string;
  source: string;
  tier: NewsSourceTier;
  timestamp: number;
  coin: string | null;
  url: string | null;
  verified: boolean;
  priority: number;
}

export interface InstitutionalNewsStatus {
  feedId: string;
  rssSourceCount: number;
  rssLiveCount: number;
  squawkConnected: boolean;
  squawkBuffered: number;
  squawkAuthenticated: boolean;
  cryptoPanicEnabled: boolean;
  cryptoPanicLive: boolean;
  cryptoPanicCount: number;
  macroFredEnabled: boolean;
  macroFredLiveCount: number;
  macroTreasuryLive: boolean;
  hlWireLiveCount?: number;
  lastFetchAt: number;
  tiers: NewsSourceTier[];
}
