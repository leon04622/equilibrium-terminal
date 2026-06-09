/** Phase 38 — Live deployment, DevOps & global operations. */

export type DeploymentEnvironment =
  | "local"
  | "staging"
  | "qa"
  | "production"
  | "enterprise";

export type ReleaseChannel = "stable" | "canary" | "blue" | "green";

export type RegionId = "us-east" | "eu-west" | "ap-singapore" | "edge-global";

export type RegionHealth = "healthy" | "degraded" | "failover" | "offline";

export type IncidentSeverity = "sev1" | "sev2" | "sev3" | "info";

export type IncidentStatus = "open" | "mitigating" | "resolved";

export interface RegionStatus {
  id: RegionId;
  label: string;
  provider: string;
  health: RegionHealth;
  latencyMs: number;
  trafficPct: number;
  failoverTarget: RegionId | null;
}

export interface ReleaseManifest {
  channel: ReleaseChannel;
  version: string;
  buildId: string;
  deployedAt: number;
  previousVersion: string | null;
  rollbackAvailable: boolean;
}

export interface StreamResilienceStatus {
  wsConnected: boolean;
  reconnectCount: number;
  lastMessageAgeMs: number;
  dedupeBufferDepth: number;
  replayQueueDepth: number;
  ingestionLagMs: number;
  stressMode: boolean;
}

export interface DatabaseOpsStatus {
  replication: "synced" | "lagging" | "offline";
  backupLastAt: number | null;
  backupRetentionDays: number;
  pendingMigrations: number;
  failoverReady: boolean;
}

export interface ObservabilitySnapshot {
  traceSampleRate: number;
  logLevel: string;
  metricsEps: number;
  alertOpenCount: number;
  p95ApiMs: number;
  p95StreamFlushMs: number;
  heapMb: number;
  fps: number;
}

export interface OperationalIncident {
  id: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  runbookId: string;
  openedAt: number;
}

export interface DevOpsOperationsSnapshot {
  environment: DeploymentEnvironment;
  release: ReleaseManifest;
  regions: RegionStatus[];
  activeRegion: RegionId;
  uptimePct: number;
  sloTargetPct: number;
  observability: ObservabilitySnapshot;
  stream: StreamResilienceStatus;
  database: DatabaseOpsStatus;
  incidents: OperationalIncident[];
  cicdLastRun: string | null;
  cicdStatus: "pass" | "fail" | "running" | "unknown";
  operationalScore: number;
  updatedAt: number;
}
