/** Phase 18 — Unified Market Knowledge Graph (Bloomberg-class entity linking). */

export type GraphEntityKind =
  | "asset"
  | "exchange"
  | "wallet"
  | "narrative"
  | "sector"
  | "event"
  | "liquidity_zone"
  | "macro_event"
  | "signal"
  | "intelligence"
  | "funding_regime"
  | "volatility_regime"
  | "alert"
  | "summary";

export type GraphRelation =
  | "affects"
  | "correlates_with"
  | "flows_to"
  | "targets"
  | "published_by"
  | "belongs_to"
  | "exhibits"
  | "precedes"
  | "follows"
  | "related_to"
  | "impacts"
  | "concentrated_in"
  | "diverges_from"
  | "linked_macro";

export interface GraphEntity {
  id: string;
  kind: GraphEntityKind;
  label: string;
  coin: string | null;
  sector: string | null;
  timestamp: number;
  metadata: Record<string, string | number | boolean>;
  snippet: string;
}

export interface GraphLink {
  id: string;
  from: string;
  to: string;
  relation: GraphRelation;
  weight: number;
  timestamp: number;
  evidence: string;
}

export interface GraphQueryMatch {
  entity: GraphEntity;
  score: number;
  path: string[];
}

export interface MarketGraphQueryResult {
  queryId: string;
  query: string;
  matches: GraphQueryMatch[];
  subgraph: {
    entities: GraphEntity[];
    links: GraphLink[];
  };
  interpretation: string;
  elapsedMs: number;
  cached: boolean;
}

export interface AssetHubSection {
  id: string;
  title: string;
  items: { label: string; value: string; emphasis?: "up" | "down" | "warn" | "neutral" }[];
}

export interface AssetIntelligenceHub {
  coin: string;
  symbol: string;
  headline: string;
  sections: AssetHubSection[];
  relatedEntities: GraphEntity[];
  timeline: Array<{
    id: string;
    timestamp: number;
    headline: string;
    channel: string;
  }>;
  graphLinks: GraphLink[];
  aiSummary: string;
  updatedAt: number;
}

export interface CrossMarketInsight {
  id: string;
  category:
    | "sector_rotation"
    | "stablecoin_flow"
    | "exchange_divergence"
    | "btc_dominance"
    | "macro_correlation"
    | "liquidity_migration"
    | "narrative_spread";
  headline: string;
  detail: string;
  coins: string[];
  priority: number;
}

export interface MarketGraphSnapshot {
  entityCount: number;
  linkCount: number;
  version: number;
  updatedAt: number;
}
