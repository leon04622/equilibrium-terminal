/** Phase 49 — Institutional API, SDK & platform extensibility. */

export type PlatformDeskModeId =
  | "api_gateway"
  | "sdk_dev"
  | "quant_research"
  | "enterprise_connect"
  | "embed_ops";

export type PlatformApiKind = "rest" | "websocket" | "streaming" | "webhook" | "embed";

export type SdkLanguage = "typescript" | "python" | "go" | "rust";

export type PluginSlot = "panel" | "omnibar" | "dashboard" | "workspace" | "analytics";

export interface GatewayEndpoint {
  id: string;
  path: string;
  kind: PlatformApiKind;
  domain: string;
  version: string;
  status: "live" | "connected" | "staged";
  latencyMs: number;
  requestsPerMin: number;
  authMethod: string;
  description: string;
}

export interface SdkPackage {
  id: string;
  language: SdkLanguage;
  packageName: string;
  version: string;
  status: "published" | "beta" | "staged";
  capabilities: string[];
  downloadsEstimate: number;
}

export interface PlatformPlugin {
  id: string;
  name: string;
  slot: PluginSlot;
  version: string;
  status: "active" | "staged" | "disabled";
  author: string;
}

export interface QuantApiSurface {
  id: string;
  path: string;
  category: "replay" | "volatility" | "liquidity" | "derivatives" | "events" | "research";
  streaming: boolean;
  status: "live" | "staged";
}

export interface WebhookSubscription {
  id: string;
  eventType: string;
  targetUrl: string;
  status: "active" | "paused" | "staged";
  deliveries24h: number;
  lastDeliveryAt: number | null;
}

export interface EnterpriseConnector {
  id: string;
  system: string;
  category: "treasury" | "execution" | "risk" | "reporting" | "dashboard";
  protocol: "rest" | "webhook" | "fix_staged";
  status: "connected" | "staged";
}

export interface ApiKeyScope {
  id: string;
  label: string;
  scopes: string[];
  rateLimitPerMin: number;
  quotaDaily: number;
  usageToday: number;
  lastUsedAt: number | null;
}

export interface DeveloperResource {
  id: string;
  title: string;
  type: "docs" | "playground" | "example" | "onboarding";
  url: string;
  status: "live" | "staged";
}

export interface EmbeddableSurface {
  id: string;
  name: string;
  endpoint: string;
  format: "json" | "sse" | "iframe";
  subscribers: number;
  status: "live" | "connected" | "staged";
}

export interface PlatformObservabilityRow {
  route: string;
  p50Ms: number;
  p99Ms: number;
  errorRatePct: number;
  requestsPerMin: number;
}

export interface PlatformDeskDashboardMode {
  id: PlatformDeskModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface PlatformDeskTelemetrySnapshot {
  endpointCount: number;
  liveEndpoints: number;
  sdkCount: number;
  activePlugins: number;
  webhookDeliveries24h: number;
  computeLatencyMs: number;
  extensibilityScore: number;
}

export interface PlatformDeskSnapshot {
  asset: string;
  gateway: GatewayEndpoint[];
  sdks: SdkPackage[];
  plugins: PlatformPlugin[];
  quantApis: QuantApiSurface[];
  webhooks: WebhookSubscription[];
  enterprise: EnterpriseConnector[];
  apiKeys: ApiKeyScope[];
  devResources: DeveloperResource[];
  embeddables: EmbeddableSurface[];
  observability: PlatformObservabilityRow[];
  integrationBrief: string;
  dashboardModes: PlatformDeskDashboardMode[];
  activeMode: PlatformDeskModeId;
  telemetry: PlatformDeskTelemetrySnapshot;
  platformScore: number;
  updatedAt: number;
}
