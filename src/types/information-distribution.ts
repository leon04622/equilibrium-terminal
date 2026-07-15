/** Phase 23 — Real-Time Information Distribution System. */

export type NewswireCategory =
  | "macro"
  | "liquidity"
  | "exchange"
  | "whale"
  | "stablecoin"
  | "etf"
  | "volatility"
  | "liquidation"
  | "funding"
  | "bridge"
  | "chain"
  | "narrative"
  | "operational";

export type DeliveryChannel =
  | "terminal"
  | "desktop"
  | "browser_push"
  | "email"
  | "webhook"
  | "telegram"
  | "discord";

export type IncidentKind =
  | "exchange_outage"
  | "api_instability"
  | "stablecoin_depeg"
  | "liquidation_cascade"
  | "abnormal_volatility"
  | "treasury_movement"
  | "chain_congestion"
  | "bridge_failure";

export type DistributionBriefingKind =
  | "pre_market"
  | "volatility"
  | "macro"
  | "liquidity"
  | "narrative"
  | "exchange_stress"
  | "daily_state";

export interface NewswireItem {
  id: string;
  category: NewswireCategory;
  headline: string;
  detail: string;
  coin: string | null;
  severity: "info" | "watch" | "critical";
  source: string;
  urgencyScore: number;
  impactScore: number;
  relevanceScore: number;
  compositeScore: number;
  confidence: number;
  verified: boolean;
  timestamp: number;
  /** External headline link when sourced from crypto RSS wire. */
  articleUrl?: string | null;
}

export interface MarketIncident {
  id: string;
  kind: IncidentKind;
  headline: string;
  detail: string;
  coin: string | null;
  severity: "info" | "watch" | "critical";
  status: "active" | "monitoring" | "resolved";
  startedAt: number;
  updatedAt: number;
  sourceVerified: boolean;
}

export interface DistributionBriefing {
  id: string;
  kind: DistributionBriefingKind;
  headline: string;
  summary: string;
  bullets: string[];
  severity: "info" | "watch" | "critical";
  generatedAt: number;
}

export interface PersonalizedDeliveryItem {
  id: string;
  coin: string;
  headline: string;
  reason: string;
  severity: "info" | "watch" | "critical";
  timestamp: number;
}

export interface DeliveryChannelStatus {
  channel: DeliveryChannel;
  enabled: boolean;
  label: string;
  lastDeliveryAt: number | null;
  pendingCount: number;
  status: "ready" | "configured" | "disabled" | "error";
}

export interface InformationQualityReport {
  overallConfidence: number;
  duplicatesSuppressed: number;
  verifiedSourceRatio: number;
  falsePositiveEstimate: number;
  timestampIntegrity: number;
  lastValidationAt: number;
}

export interface SyndicationFeedMeta {
  feedId: string;
  format: "json" | "rss";
  eventsPerMinute: number;
  lastPublishedAt: number;
  subscriberReady: boolean;
}

export interface InformationDistributionSnapshot {
  newswire: NewswireItem[];
  incidents: MarketIncident[];
  briefings: DistributionBriefing[];
  personalized: PersonalizedDeliveryItem[];
  deliveryChannels: DeliveryChannelStatus[];
  quality: InformationQualityReport;
  syndication: SyndicationFeedMeta;
  distributionScore: number;
  updatedAt: number;
}

export interface DistributionChannelPrefs {
  desktop: boolean;
  browserPush: boolean;
  email: boolean;
  webhook: boolean;
  telegram: boolean;
  discord: boolean;
  webhookUrl: string;
  minSeverity: "info" | "watch" | "critical";
}
