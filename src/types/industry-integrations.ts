/** Phase 29 — Institutional Integrations & Industry Embedding. */

export type IntegrationCategory =
  | "exchange"
  | "dex"
  | "options"
  | "prime_broker"
  | "custodian"
  | "treasury"
  | "otc"
  | "data_provider"
  | "macro"
  | "liquidity";

export type IntegrationStatus = "live" | "connected" | "staged" | "degraded" | "offline";

export type ApiEndpointKind =
  | "rest"
  | "websocket"
  | "webhook"
  | "streaming_feed"
  | "embed"
  | "report";

export type DeploymentMode = "saas" | "dedicated" | "white_label" | "air_gapped";

export type ReportKind =
  | "portfolio"
  | "intelligence"
  | "volatility"
  | "liquidity"
  | "treasury"
  | "operational_briefing";

export interface ExchangeIntegration {
  id: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  venues: number;
  latencyMs: number | null;
  executionEnabled: boolean;
  dataFeedEnabled: boolean;
  lastSyncAt: number | null;
}

export interface DataPartnership {
  id: string;
  partner: string;
  category: IntegrationCategory;
  tier: "standard" | "premium" | "proprietary";
  feedsActive: number;
  status: IntegrationStatus;
  contractStatus: "active" | "trial" | "pending";
}

export interface ExecutionRoute {
  id: string;
  venue: string;
  asset: string;
  routeType: "direct" | "smart" | "aggregated" | "otc";
  fillRatePct: number;
  avgSlippageBps: number;
  liquidityScore: number;
  active: boolean;
}

export interface ExternalApiEndpoint {
  id: string;
  path: string;
  kind: ApiEndpointKind;
  version: string;
  status: IntegrationStatus;
  requestsPerMin: number;
  authMethod: "jwt" | "api_key" | "siwe" | "webhook_secret";
  description: string;
}

export interface EmbeddableWidget {
  id: string;
  name: string;
  type: "intelligence_feed" | "market_monitor" | "portfolio_strip" | "volatility_gauge" | "newswire";
  endpoint: string;
  format: "json" | "sse" | "iframe";
  subscribers: number;
  status: IntegrationStatus;
}

export interface InstitutionalReport {
  id: string;
  kind: ReportKind;
  title: string;
  summary: string;
  generatedAt: number;
  distributionChannels: string[];
  status: "published" | "draft" | "scheduled";
}

export interface WhiteLabelDeployment {
  id: string;
  orgName: string;
  mode: DeploymentMode;
  brandingEnabled: boolean;
  dedicatedInfra: boolean;
  privateIntelEnv: boolean;
  region: string;
  status: IntegrationStatus;
}

export interface PublicMarketBrief {
  id: string;
  headline: string;
  category: "commentary" | "incident" | "volatility" | "briefing" | "ecosystem";
  severity: "info" | "watch" | "critical";
  publishedAt: number;
  reachEstimate: number;
}

export interface ScalabilityVitals {
  capacityHeadroomPct: number;
  uptimePct: number;
  redundancyActive: boolean;
  autoScaleReady: boolean;
  supportTier: "standard" | "enterprise" | "mission_critical";
  deploymentReady: boolean;
}

export interface IndustryTrustSignals {
  infrastructureGrade: "development" | "production" | "mission_critical";
  institutionalCredibilityScore: number;
  stressTestPassed: boolean;
  partnerCount: number;
  apiUptimePct: number;
  embedDeployments: number;
}

export interface IndustryIntegrationsSnapshot {
  exchanges: ExchangeIntegration[];
  dataPartnerships: DataPartnership[];
  executionRoutes: ExecutionRoute[];
  apiEndpoints: ExternalApiEndpoint[];
  embeddables: EmbeddableWidget[];
  reports: InstitutionalReport[];
  deployments: WhiteLabelDeployment[];
  publicBriefs: PublicMarketBrief[];
  scalability: ScalabilityVitals;
  trust: IndustryTrustSignals;
  integrationScore: number;
  updatedAt: number;
}
