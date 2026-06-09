"use client";

import { useEffect } from "react";
import { AuditLogEngine } from "@/lib/security/AuditLogEngine";
import { SecurityOrchestrator } from "@/lib/security/SecurityOrchestrator";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useSecurityStore } from "@/store/useSecurityStore";
import type { AuditLogEntry, ThreatEvent } from "@/types/security-trust";

const POLL_MS = 20_000;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Security trust layer — vitals poll, local audit, session-bound WS hints. */
export function useSecurityLayer(enabled = true): void {
  const claims = useProductionConfigStore((s) => s.claims);

  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      if (document.hidden) return;
      const local = SecurityOrchestrator.snapshot(claims);
      useSecurityStore.getState().setSnapshot(local);

      const vitals = await fetchJson<{
        recentAudit?: AuditLogEntry[];
        recentThreats?: ThreatEvent[];
        trustScore?: number;
      }>("/api/security/vitals");

      if (vitals?.recentAudit) {
        useSecurityStore.getState().setServerAudit(vitals.recentAudit);
      }
      if (vitals?.recentThreats) {
        useSecurityStore.getState().setServerThreats(vitals.recentThreats);
      }
    };

    refresh();
    const id = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, claims]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(async () => {
      const health = useProductionConfigStore.getState().sessionHealth;
      if (health === "jwt_expiring") {
        try {
          await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
          AuditLogEngine.logAuth("token_refresh", "ok", "proactive rotation");
        } catch {
          AuditLogEngine.logAuth("token_refresh", "error", "refresh failed");
        }
      }
    }, 120_000);
    return () => window.clearInterval(id);
  }, [enabled]);
}
