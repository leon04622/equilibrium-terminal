import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  AuthSessionClaims,
  CloudSyncStatus,
  EntitlementMatrix,
  PlatformInfrastructureVitals,
  ServerSaveLogEntry,
  SessionHealthFlag,
  TeamPermissionMatrix,
  TeamRole,
  UserSessionState,
} from "@/types/production-platform";
import {
  DEFAULT_PERMISSION_MATRIX,
  ENTITLEMENTS_BY_TIER,
} from "@/types/production-platform";

export type {
  AuthSessionClaims,
  CloudSyncStatus,
  EntitlementMatrix,
  PlatformInfrastructureVitals,
  ServerSaveLogEntry,
  SessionHealthFlag,
  TeamPermissionMatrix,
  TeamRole,
  UserSessionState,
} from "@/types/production-platform";

const LOG_MAX = 64;

function defaultVitals(): PlatformInfrastructureVitals {
  return {
    gatewayLatencyMs: 0,
    gatewayUpstreamConnections: 0,
    gatewayFanoutClients: 0,
    workerQueueDepth: 0,
    workerQueueLagMs: 0,
    workerProcessedPerSecond: 0,
    dbCommitLatencyMs: 0,
    dbPendingWrites: 0,
    activeSubscriptionTier: "desk",
    activeDeskCount: 1,
    systemUptimeSec: 0,
    updatedAt: Date.now(),
  };
}

export interface ProductionConfigState {
  session: UserSessionState | null;
  claims: AuthSessionClaims | null;
  permissions: TeamPermissionMatrix;
  entitlements: EntitlementMatrix;
  cloudSyncStatus: CloudSyncStatus;
  sessionHealth: SessionHealthFlag;
  gatewayMultiplexActive: boolean;
  lastSnapshotHash: string | null;
  lastSnapshotAt: number | null;
  vitals: PlatformInfrastructureVitals;
  serverSaveLogs: ServerSaveLogEntry[];
  siwePending: boolean;
  platformAuthenticated: boolean;

  setSession: (session: UserSessionState | null) => void;
  setClaims: (claims: AuthSessionClaims | null) => void;
  setCloudSyncStatus: (status: CloudSyncStatus) => void;
  setSessionHealth: (health: SessionHealthFlag) => void;
  setGatewayMultiplexActive: (active: boolean) => void;
  setSnapshotMeta: (hash: string | null, at: number | null) => void;
  patchVitals: (patch: Partial<PlatformInfrastructureVitals>) => void;
  setVitals: (vitals: PlatformInfrastructureVitals) => void;
  appendSaveLog: (entry: Omit<ServerSaveLogEntry, "id" | "at">) => void;
  setSiwePending: (pending: boolean) => void;
  setPlatformAuthenticated: (authenticated: boolean) => void;
  resetPlatformState: () => void;
  primaryRole: () => TeamRole;
  can: (action: keyof TeamPermissionMatrix["admin"]) => boolean;
  isEntitled: (feature: keyof EntitlementMatrix) => boolean;
}

export const useProductionConfigStore = create<ProductionConfigState>()(
  subscribeWithSelector((set, get) => ({
    session: null,
    claims: null,
    permissions: DEFAULT_PERMISSION_MATRIX,
    entitlements: ENTITLEMENTS_BY_TIER.desk,
    cloudSyncStatus: "idle",
    sessionHealth: "jwt_invalid",
    gatewayMultiplexActive: false,
    lastSnapshotHash: null,
    lastSnapshotAt: null,
    vitals: defaultVitals(),
    serverSaveLogs: [],
    siwePending: false,
    platformAuthenticated: false,

    setSession: (session) => {
      const tier = session?.tier ?? "desk";
      set({
        session,
        entitlements: ENTITLEMENTS_BY_TIER[tier],
        permissions: DEFAULT_PERMISSION_MATRIX,
      });
    },

    setClaims: (claims) => {
      const tier = claims?.tier ?? "desk";
      set({
        claims,
        entitlements: ENTITLEMENTS_BY_TIER[tier],
        platformAuthenticated: !!claims,
      });
    },

    setCloudSyncStatus: (cloudSyncStatus) => set({ cloudSyncStatus }),
    setSessionHealth: (sessionHealth) => set({ sessionHealth }),
    setGatewayMultiplexActive: (gatewayMultiplexActive) => set({ gatewayMultiplexActive }),
    setSnapshotMeta: (lastSnapshotHash, lastSnapshotAt) =>
      set({ lastSnapshotHash, lastSnapshotAt }),
    patchVitals: (patch) =>
      set((s) => ({
        vitals: { ...s.vitals, ...patch, updatedAt: Date.now() },
      })),
    setVitals: (vitals) => set({ vitals }),
    appendSaveLog: (entry) =>
      set((s) => {
        const row: ServerSaveLogEntry = {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          at: Date.now(),
          ...entry,
        };
        const serverSaveLogs = [row, ...s.serverSaveLogs].slice(0, LOG_MAX);
        return { serverSaveLogs };
      }),
    setSiwePending: (siwePending) => set({ siwePending }),
    setPlatformAuthenticated: (platformAuthenticated) => set({ platformAuthenticated }),
    resetPlatformState: () =>
      set({
        session: null,
        claims: null,
        entitlements: ENTITLEMENTS_BY_TIER.desk,
        cloudSyncStatus: "idle",
        sessionHealth: "jwt_invalid",
        gatewayMultiplexActive: false,
        lastSnapshotHash: null,
        lastSnapshotAt: null,
        vitals: defaultVitals(),
        serverSaveLogs: [],
        siwePending: false,
        platformAuthenticated: false,
      }),

    primaryRole: () => get().session?.roles[0] ?? get().claims?.roles[0] ?? "analyst",

    can: (action) => {
      const role = get().primaryRole();
      return DEFAULT_PERMISSION_MATRIX[role][action];
    },

    isEntitled: (feature) => {
      const entitlements = get().entitlements;
      const value = entitlements[feature];
      return typeof value === "boolean" ? value : true;
    },
  })),
);
