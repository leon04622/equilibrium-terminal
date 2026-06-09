/** Phase 13 — production platform identity, entitlements, and infrastructure vitals. */

import type { Layout } from "react-grid-layout";
import type { AlertRule } from "@/types/alerts";
import type { WidgetType, WorkspaceWidget } from "@/types/terminal-schema";

export type TeamRole = "analyst" | "trader" | "admin";

export type SubscriptionTier = "desk" | "team" | "enterprise";

export type CloudSyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "degraded"
  | "offline";

export type SessionHealthFlag =
  | "healthy"
  | "jwt_expiring"
  | "jwt_invalid"
  | "gateway_lag"
  | "queue_backpressure"
  | "snapshot_drift";

export interface UserSessionState {
  sessionId: string;
  userId: string;
  walletAddress: string;
  issuedAt: number;
  expiresAt: number;
  roles: TeamRole[];
  tier: SubscriptionTier;
  /** Workspace identity — decoupled from ephemeral trading agent keys. */
  workspaceId: string;
  lastVerifiedAt: number;
}

export interface TeamPermissionMatrix {
  analyst: {
    viewMarkets: boolean;
    editWatchlists: boolean;
    runBacktests: boolean;
    placeOrders: boolean;
    manageTeam: boolean;
    deployInfra: boolean;
  };
  trader: {
    viewMarkets: boolean;
    editWatchlists: boolean;
    runBacktests: boolean;
    placeOrders: boolean;
    manageTeam: boolean;
    deployInfra: boolean;
  };
  admin: {
    viewMarkets: boolean;
    editWatchlists: boolean;
    runBacktests: boolean;
    placeOrders: boolean;
    manageTeam: boolean;
    deployInfra: boolean;
  };
}

export interface EntitlementMatrix {
  tier: SubscriptionTier;
  maxDesks: number;
  maxWatchlistItems: number;
  alphaLabEnabled: boolean;
  teamNetEnabled: boolean;
  diagnosticsEnabled: boolean;
  infraDiagnosticsEnabled: boolean;
  telemetryExportEnabled: boolean;
  enterpriseOpsEnabled: boolean;
  industryIntegrationsEnabled: boolean;
  proprietaryIntelEnabled: boolean;
  ecosystemEnabled: boolean;
  globalStrategyEnabled: boolean;
  maxConcurrentWidgets: number;
}

export interface WatchlistEntry {
  coin: string;
  pinned: boolean;
  addedAt: number;
}

export interface OmniBarHistoryEntry {
  query: string;
  intentType: string;
  executedAt: number;
}

export interface WorkspaceSnapshotPayload {
  version: number;
  workspaceId: string;
  userId: string;
  savedAt: number;
  layout: Layout[];
  widgets: WorkspaceWidget[];
  watchlist: WatchlistEntry[];
  omniBarHistory: OmniBarHistoryEntry[];
  alertRules: AlertRule[];
  selectedCoin: string | null;
  meta: {
    terminalBuild: string;
    gridCols: number;
  };
}

export interface WorkspaceSnapshotRecord {
  payload: WorkspaceSnapshotPayload;
  serialized: string;
  contentHash: string;
  byteLength: number;
}

export interface ServerSaveLogEntry {
  id: string;
  operation: "snapshot_push" | "snapshot_pull" | "telemetry_batch" | "session_refresh";
  status: "ok" | "error" | "queued";
  message: string;
  durationMs: number;
  at: number;
}

export interface PlatformInfrastructureVitals {
  gatewayLatencyMs: number;
  gatewayUpstreamConnections: number;
  gatewayFanoutClients: number;
  workerQueueDepth: number;
  workerQueueLagMs: number;
  workerProcessedPerSecond: number;
  dbCommitLatencyMs: number;
  dbPendingWrites: number;
  activeSubscriptionTier: SubscriptionTier;
  activeDeskCount: number;
  systemUptimeSec: number;
  updatedAt: number;
}

export interface AuthSessionClaims {
  sub: string;
  sid: string;
  wallet: string;
  workspaceId: string;
  roles: TeamRole[];
  tier: SubscriptionTier;
  iat: number;
  exp: number;
}

export const SNAPSHOT_SCHEMA_VERSION = 1;

export const DEFAULT_PERMISSION_MATRIX: TeamPermissionMatrix = {
  analyst: {
    viewMarkets: true,
    editWatchlists: true,
    runBacktests: true,
    placeOrders: false,
    manageTeam: false,
    deployInfra: false,
  },
  trader: {
    viewMarkets: true,
    editWatchlists: true,
    runBacktests: true,
    placeOrders: true,
    manageTeam: false,
    deployInfra: false,
  },
  admin: {
    viewMarkets: true,
    editWatchlists: true,
    runBacktests: true,
    placeOrders: true,
    manageTeam: true,
    deployInfra: true,
  },
};

export const ENTITLEMENTS_BY_TIER: Record<SubscriptionTier, EntitlementMatrix> = {
  desk: {
    tier: "desk",
    maxDesks: 1,
    maxWatchlistItems: 24,
    alphaLabEnabled: false,
    teamNetEnabled: false,
    diagnosticsEnabled: true,
    infraDiagnosticsEnabled: false,
    telemetryExportEnabled: false,
    enterpriseOpsEnabled: false,
    industryIntegrationsEnabled: false,
    proprietaryIntelEnabled: false,
    ecosystemEnabled: false,
    globalStrategyEnabled: false,
    maxConcurrentWidgets: 12,
  },
  team: {
    tier: "team",
    maxDesks: 8,
    maxWatchlistItems: 64,
    alphaLabEnabled: true,
    teamNetEnabled: true,
    diagnosticsEnabled: true,
    infraDiagnosticsEnabled: true,
    telemetryExportEnabled: true,
    enterpriseOpsEnabled: false,
    industryIntegrationsEnabled: false,
    proprietaryIntelEnabled: true,
    ecosystemEnabled: true,
    globalStrategyEnabled: false,
    maxConcurrentWidgets: 16,
  },
  enterprise: {
    tier: "enterprise",
    maxDesks: 256,
    maxWatchlistItems: 512,
    alphaLabEnabled: true,
    teamNetEnabled: true,
    diagnosticsEnabled: true,
    infraDiagnosticsEnabled: true,
    telemetryExportEnabled: true,
    enterpriseOpsEnabled: true,
    industryIntegrationsEnabled: true,
    proprietaryIntelEnabled: true,
    ecosystemEnabled: true,
    globalStrategyEnabled: true,
    maxConcurrentWidgets: 24,
  },
};

export const WIDGET_ENTITLEMENT_MAP: Record<WidgetType, keyof EntitlementMatrix | null> = {
  hyperbook: null,
  chart: null,
  intelligence: null,
  copilot: null,
  alerts: null,
  proactive: null,
  teamdesk: "teamNetEnabled",
  macro: null,
  diagnostics: "diagnosticsEnabled",
  alphalab: "alphaLabEnabled",
  infra: "infraDiagnosticsEnabled",
  domladder: null,
  slippageradar: null,
  decision: null,
  surveillance: null,
  knowledgegraph: null,
  traderjournal: null,
  research: null,
  dailyops: null,
  marketcoverage: null,
  reliability: null,
  newswire: null,
  ingestion: null,
  intelengine: null,
  collab: "teamNetEnabled",
  enterpriseops: "enterpriseOpsEnabled",
  integrations: "industryIntegrationsEnabled",
  propintel: "proprietaryIntelEnabled",
  ecosystem: "ecosystemEnabled",
  globalstrategy: "globalStrategyEnabled",
  commercial: "diagnosticsEnabled",
  execintel: "diagnosticsEnabled",
  portfoliodesk: "ecosystemEnabled",
  derivdesk: "ecosystemEnabled",
  systemicintel: null,
  memorydesk: null,
  researchdesk: null,
  platformdesk: null,
  mobiledesk: null,
  opscommand: "infraDiagnosticsEnabled",
  billingdesk: "diagnosticsEnabled",
  deskops: "teamNetEnabled",
  globaldesk: null,
  operatordesk: null,
  unifiedops: null,
  liveexec: null,
  marketcmd: null,
  maturitydesk: null,
  livedeploy: null,
  explaindesk: null,
  operatorjournal: null,
  livementor: null,
};
