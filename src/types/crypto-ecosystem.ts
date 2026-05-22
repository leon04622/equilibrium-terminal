/** Phase 31 — Crypto Financial Operating Ecosystem. */

export type PlatformLayer =
  | "terminal"
  | "intelligence"
  | "execution"
  | "organizational"
  | "infrastructure"
  | "api";

export type LayerHealth = "operational" | "degraded" | "offline" | "staged";

export type AutomationKind =
  | "workflow_routing"
  | "monitoring"
  | "information_organize"
  | "report_dispatch"
  | "alert_escalation";

export interface PlatformLayerStatus {
  layer: PlatformLayer;
  label: string;
  health: LayerHealth;
  activeModules: number;
  headline: string;
}

export interface PortfolioExposureRow {
  asset: string;
  notionalUsd: number;
  pctPortfolio: number;
  venue: string;
  pnlUsd: number;
  collateralUsd: number;
  leverage: number;
  riskBand: "low" | "moderate" | "elevated" | "critical";
}

export interface TreasuryPosition {
  asset: string;
  balanceUsd: number;
  venue: string;
  stablecoinPct: number;
  utilizationPct: number;
}

export interface RiskSurveillanceAlert {
  id: string;
  domain: "surveillance" | "liquidity" | "exchange" | "operational" | "treasury";
  headline: string;
  severity: "info" | "watch" | "critical";
  coin: string | null;
  timestamp: number;
}

export interface ExecutionAnalyticsRow {
  venue: string;
  asset: string;
  fillRatePct: number;
  avgSlippageBps: number;
  latencyMs: number;
  liquidityScore: number;
  rank: number;
}

export interface ResearchSuiteItem {
  id: string;
  kind: "thesis" | "publish" | "replay" | "narrative_archive";
  title: string;
  author: string;
  status: "active" | "archived" | "draft";
  updatedAt: number;
}

export interface OperationalAutomationTask {
  id: string;
  kind: AutomationKind;
  label: string;
  description: string;
  humanInLoop: boolean;
  active: boolean;
  lastRunAt: number | null;
}

export interface ComplianceControl {
  id: string;
  control: string;
  status: "pass" | "watch" | "fail";
  category: "audit" | "governance" | "reporting" | "policy";
  lastCheckedAt: number;
}

export interface DeveloperEcosystemModule {
  id: string;
  name: string;
  type: "api" | "sdk" | "webhook" | "plugin";
  endpoint: string;
  status: LayerHealth;
  consumers: number;
}

export interface MarketMemoryNode {
  id: string;
  kind: "event" | "vol_analog" | "narrative" | "liquidity_regime";
  title: string;
  relevance: number;
  archivedAt: number;
}

export interface CryptoEcosystemSnapshot {
  layers: PlatformLayerStatus[];
  portfolio: PortfolioExposureRow[];
  treasury: TreasuryPosition[];
  totalAumUsd: number;
  netPnlUsd: number;
  riskAlerts: RiskSurveillanceAlert[];
  executionAnalytics: ExecutionAnalyticsRow[];
  researchSuite: ResearchSuiteItem[];
  automations: OperationalAutomationTask[];
  compliance: ComplianceControl[];
  developerModules: DeveloperEcosystemModule[];
  marketMemory: MarketMemoryNode[];
  ecosystemScore: number;
  operatingReadiness: number;
  updatedAt: number;
}
