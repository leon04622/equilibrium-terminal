"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Layout } from "react-grid-layout";
import type { Address, Hex } from "viem";
import { useSignMessage } from "wagmi";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { productionAuthEngine } from "@/lib/infrastructure/AuthEngine";
import { clientPersistenceQueue } from "@/lib/infrastructure/PersistenceQueue";
import { SnapshotSerializer } from "@/lib/infrastructure/SnapshotSerializer";
import { applyWorkspaceSnapshot } from "@/lib/workflow/WorkspaceSnapshotRestore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { terminalBus } from "@/store/eventBus";
import { useTerminalStore } from "@/store/terminalStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import type { PlatformInfrastructureVitals } from "@/types/production-platform";

const VITALS_POLL_MS = 10_000;
const SESSION_POLL_MS = 60_000;
const SNAPSHOT_AUTOSAVE_MS = 60_000;
const LAYOUT_PUSH_DEBOUNCE_MS = 8_000;

export interface UseProductionPlatformOptions {
  layout: Layout[];
  enabled?: boolean;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = `http_${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) detail = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

function describeSiweError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("jwt_not_configured")) {
    return process.env.NODE_ENV === "production"
      ? "Desk auth not configured on server — contact operator."
      : "Desk auth needs EQUILIBRIUM_JWT_SECRET in .env.local (≥32 chars).";
  }
  if (lower.includes("user rejected") || lower.includes("denied") || lower.includes("cancel")) {
    return "Wallet sign-in cancelled.";
  }
  if (lower.includes("verification_failed") || lower.includes("invalid")) {
    return "Signature rejected — try Sign In again.";
  }
  if (lower.includes("internal_error") || lower.includes("http_500")) {
    return process.env.NODE_ENV === "production"
      ? "Auth server error — wait a moment and retry."
      : "Auth server error — set EQUILIBRIUM_JWT_SECRET in .env.local and retry.";
  }
  if (lower.includes("http_401") || lower.includes("http_403")) {
    return "Sign-in rejected — reconnect wallet and retry.";
  }
  return "Sign-in failed — retry or reconnect wallet.";
}

export function useProductionPlatform({ layout, enabled = true }: UseProductionPlatformOptions) {
  const { address, isConnected } = useHyperliquidAuthContext();
  const { signMessageAsync } = useSignMessage();

  const setSession = useProductionConfigStore((s) => s.setSession);
  const setClaims = useProductionConfigStore((s) => s.setClaims);
  const setCloudSyncStatus = useProductionConfigStore((s) => s.setCloudSyncStatus);
  const setSessionHealth = useProductionConfigStore((s) => s.setSessionHealth);
  const setGatewayMultiplexActive = useProductionConfigStore((s) => s.setGatewayMultiplexActive);
  const setVitals = useProductionConfigStore((s) => s.setVitals);
  const patchVitals = useProductionConfigStore((s) => s.patchVitals);
  const appendSaveLog = useProductionConfigStore((s) => s.appendSaveLog);
  const setSnapshotMeta = useProductionConfigStore((s) => s.setSnapshotMeta);
  const setSiwePending = useProductionConfigStore((s) => s.setSiwePending);
  const setSiweLastError = useProductionConfigStore((s) => s.setSiweLastError);
  const claims = useProductionConfigStore((s) => s.claims);
  const siwePending = useProductionConfigStore((s) => s.siwePending);
  const snapshotPulledRef = useRef(false);
  const layoutPushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const data = await fetchJson<{
        authenticated: boolean;
        claims?: import("@/types/production-platform").AuthSessionClaims;
        session?: import("@/types/production-platform").UserSessionState;
        health?: "healthy" | "jwt_expiring" | "jwt_invalid";
      }>("/api/auth/session");

      if (!data.authenticated || !data.claims) {
        setClaims(null);
        setSession(null);
        setSessionHealth("jwt_invalid");
        return;
      }

      setClaims(data.claims);
      if (data.session) setSession(data.session);
      setSessionHealth(data.health ?? productionAuthEngine.sessionHealthFromClaims(data.claims));
    } catch {
      setSessionHealth("jwt_invalid");
    }
  }, [setClaims, setSession, setSessionHealth]);

  const loginWithSiwe = useCallback(async () => {
    if (!address || !isConnected) return false;
    setSiwePending(true);
    setSiweLastError(null);
    setCloudSyncStatus("syncing");
    const started = Date.now();
    try {
      const challenge = await fetchJson<{
        message: string;
        nonce: string;
        expiresAt: number;
      }>(
        `/api/auth/siwe?address=${encodeURIComponent(address)}&chainId=42161`,
      );

      const signature = (await signMessageAsync({
        message: challenge.message,
      })) as Hex;

      const result = await fetchJson<{
        session: import("@/types/production-platform").UserSessionState;
        claims: import("@/types/production-platform").AuthSessionClaims;
      }>("/api/auth/siwe", {
        method: "POST",
        body: JSON.stringify({ message: challenge.message, signature }),
      });

      setSession(result.session);
      setClaims(result.claims);
      setSessionHealth("healthy");
      setCloudSyncStatus("synced");
      setSiweLastError(null);
      snapshotPulledRef.current = false;
      appendSaveLog({
        operation: "session_refresh",
        status: "ok",
        message: "SIWE platform session established",
        durationMs: Date.now() - started,
      });
      return true;
    } catch (err) {
      const raw = err instanceof Error ? err.message : "SIWE login failed";
      const friendly = describeSiweError(raw);
      setSiweLastError(friendly);
      setCloudSyncStatus("degraded");
      appendSaveLog({
        operation: "session_refresh",
        status: "error",
        message: friendly,
        durationMs: Date.now() - started,
      });
      return false;
    } finally {
      setSiwePending(false);
    }
  }, [
    address,
    isConnected,
    signMessageAsync,
    setSession,
    setClaims,
    setSessionHealth,
    setCloudSyncStatus,
    setSiwePending,
    setSiweLastError,
    appendSaveLog,
  ]);

  const pushSnapshot = useCallback(async () => {
    if (!claims) return false;
    const started = Date.now();
    setCloudSyncStatus("syncing");
    try {
      const widgets = useTerminalStore.getState().widgets;
      const selectedCoin = useTerminalStore.getState().selectedCoin;
      const alertRules = useAlertStore.getState().rules;
      const watchlist = useInformationDiscoveryStore.getState().watchlist.map((w) => ({
        coin: w.coin,
        pinned: w.coin === selectedCoin,
        addedAt: w.addedAt,
      }));
      const record = await SnapshotSerializer.pack({
        workspaceId: claims.workspaceId,
        userId: claims.sub,
        layout,
        widgets,
        watchlist,
        omniBarHistory: [],
        alertRules,
        selectedCoin,
      });

      await fetchJson<{ ok: boolean; contentHash: string }>("/api/workspace/snapshot", {
        method: "PUT",
        body: JSON.stringify({ record }),
      });

      setSnapshotMeta(record.contentHash, Date.now());
      setCloudSyncStatus("synced");
      appendSaveLog({
        operation: "snapshot_push",
        status: "ok",
        message: `Snapshot ${record.byteLength}B committed`,
        durationMs: Date.now() - started,
      });
      return true;
    } catch (err) {
      setCloudSyncStatus("degraded");
      appendSaveLog({
        operation: "snapshot_push",
        status: "error",
        message: err instanceof Error ? err.message : "Snapshot push failed",
        durationMs: Date.now() - started,
      });
      return false;
    }
  }, [claims, layout, setSnapshotMeta, setCloudSyncStatus, appendSaveLog]);

  const pullSnapshot = useCallback(async () => {
    if (!claims) return false;
    const started = Date.now();
    setCloudSyncStatus("syncing");
    try {
      const data = await fetchJson<{
        snapshot: import("@/types/production-platform").WorkspaceSnapshotRecord;
      }>("/api/workspace/snapshot");
      const payload = await SnapshotSerializer.unpack(data.snapshot);
      const result = applyWorkspaceSnapshot(payload);
      setSnapshotMeta(data.snapshot.contentHash, payload.savedAt);
      setCloudSyncStatus("synced");
      appendSaveLog({
        operation: "snapshot_pull",
        status: result.warnings.length > 0 ? "error" : "ok",
        message:
          result.warnings.length > 0
            ? `Restored with warnings: ${result.warnings.join("; ")}`
            : "Workspace snapshot restored",
        durationMs: Date.now() - started,
      });
      return payload;
    } catch (err) {
      setCloudSyncStatus(err instanceof Error && err.message.includes("404") ? "idle" : "degraded");
      appendSaveLog({
        operation: "snapshot_pull",
        status: "error",
        message: err instanceof Error ? err.message : "Snapshot pull failed",
        durationMs: Date.now() - started,
      });
      return null;
    }
  }, [claims, setSnapshotMeta, setCloudSyncStatus, appendSaveLog]);

  useEffect(() => {
    if (!enabled) return;

    clientPersistenceQueue.setFlushHandler(async (jobs) => {
      const accepted: string[] = [];
      const failed: string[] = [];
      try {
        const res = await fetchJson<{ accepted: string[] }>("/api/infrastructure/persist", {
          method: "POST",
          body: JSON.stringify({
            jobs: jobs.map((j) => ({ kind: j.kind, payload: j.payload })),
          }),
        });
        accepted.push(...res.accepted);
        for (const job of jobs) {
          if (!res.accepted.includes(job.id)) failed.push(job.id);
        }
      } catch {
        failed.push(...jobs.map((j) => j.id));
      }
      return { accepted, failed };
    });
    clientPersistenceQueue.start();

    // Gateway metrics piggyback on primary terminal stream — avoid duplicate upstream WS at boot.
    setGatewayMultiplexActive(true);
    patchVitals({
      gatewayUpstreamConnections: 1,
      gatewayFanoutClients: 1,
    });

    return () => {
      clientPersistenceQueue.stop();
      setGatewayMultiplexActive(false);
    };
  }, [enabled, patchVitals, setGatewayMultiplexActive]);

  useEffect(() => {
    if (!enabled) return;
    const pollVitals = async () => {
      if (document.hidden) return;
      try {
        const lastMessageAt = useTerminalStore.getState().lastMessageAt;
        const gatewayLatencyMs =
          lastMessageAt === null ? 0 : Math.max(0, Date.now() - lastMessageAt);
        await fetch("/api/infrastructure/vitals", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gatewayLatencyMs,
            gatewayFanoutClients: 1,
          }),
        });
        const vitals = await fetchJson<PlatformInfrastructureVitals>(
          "/api/infrastructure/vitals",
        );
        setVitals(vitals);
        if (vitals.workerQueueLagMs > 500) {
          setSessionHealth("queue_backpressure");
        }
      } catch {
        setCloudSyncStatus("offline");
      }
    };
    void pollVitals();
    const id = window.setInterval(() => void pollVitals(), VITALS_POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, setVitals, setCloudSyncStatus, setSessionHealth]);

  useEffect(() => {
    if (!enabled) return;
    void refreshSession();
    const id = window.setInterval(() => void refreshSession(), SESSION_POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, refreshSession]);

  useEffect(() => {
    if (!enabled) return;
    return terminalBus.on("platform:sign-in", () => {
      void loginWithSiwe();
    });
  }, [enabled, loginWithSiwe]);

  useEffect(() => {
    if (!enabled || !claims) return;
    const id = window.setInterval(() => {
      const telemetry = useTraderTelemetryStore.getState().exportAnonymizedBatch();
      if (telemetry.length === 0) return;
      clientPersistenceQueue.enqueue(
        "telemetry_batch",
        claims.sub,
        JSON.stringify(telemetry),
      );
    }, 15_000);
    return () => window.clearInterval(id);
  }, [enabled, claims]);

  useEffect(() => {
    if (!enabled || !claims || snapshotPulledRef.current) return;
    snapshotPulledRef.current = true;
    void pullSnapshot();
  }, [enabled, claims, pullSnapshot]);

  useEffect(() => {
    if (!enabled || !claims) return;
    const schedulePush = () => {
      if (layoutPushTimerRef.current) clearTimeout(layoutPushTimerRef.current);
      layoutPushTimerRef.current = setTimeout(() => {
        layoutPushTimerRef.current = null;
        void pushSnapshot();
      }, LAYOUT_PUSH_DEBOUNCE_MS);
    };
    const offLayout = terminalBus.on("workspace:layout-commit", schedulePush);
    return () => {
      offLayout();
      if (layoutPushTimerRef.current) clearTimeout(layoutPushTimerRef.current);
    };
  }, [enabled, claims, pushSnapshot]);

  useEffect(() => {
    if (!enabled || !claims) return;
    const id = window.setInterval(() => void pushSnapshot(), SNAPSHOT_AUTOSAVE_MS);
    return () => window.clearInterval(id);
  }, [enabled, claims, pushSnapshot]);

  return {
    loginWithSiwe,
    refreshSession,
    pushSnapshot,
    pullSnapshot,
  };
}
