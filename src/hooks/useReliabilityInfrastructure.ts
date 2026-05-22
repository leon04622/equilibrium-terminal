"use client";

import { useEffect } from "react";
import { terminalBus } from "@/store/eventBus";
import { ReliabilityOrchestrator } from "@/lib/reliability";
import { useReliabilityStore } from "@/store/useReliabilityStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 3_000;
const FOCUS_AUDIT_MS = 12_000;
const focusAuditAt = new Map<string, number>();

export function useReliabilityInfrastructure(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    useReliabilityStore.getState().hydrateLog();
    const refresh = () => {
      const snapshot = ReliabilityOrchestrator.snapshot();
      useReliabilityStore.getState().setSnapshot(snapshot);
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const offAlert = terminalBus.on("alert:triggered", ({ coin, severity }) => {
      useReliabilityStore.getState().appendAudit({
        category: "alert",
        severity,
        summary: `Alert triggered ${coin}`,
        detail: `Severity ${severity} alert entered action pipeline for ${coin}.`,
      });
    });
    const offFocus = terminalBus.on("widget:focus", ({ widgetId }) => {
      const now = Date.now();
      const last = focusAuditAt.get(widgetId) ?? 0;
      if (now - last < FOCUS_AUDIT_MS) return;
      focusAuditAt.set(widgetId, now);
      useReliabilityStore.getState().appendAudit({
        category: "workspace",
        severity: "info",
        summary: `Panel focus ${widgetId}`,
        detail: "Operator context switched panel focus.",
      });
    });
    const offStream = terminalBus.on("stream:status", ({ status }) => {
      useReliabilityStore.getState().appendAudit({
        category: "runtime",
        severity: status === "connected" ? "info" : status === "reconnecting" ? "watch" : "critical",
        summary: `Stream status ${status}`,
        detail: "Websocket health transition captured by reliability monitor.",
      });
    });
    const offDist = terminalBus.on("distribution:event", ({ headline, severity, coin }) => {
      useReliabilityStore.getState().appendAudit({
        category: "alert",
        severity,
        summary: `Distribution · ${coin ?? "MARKET"}`,
        detail: headline,
      });
    });
    const offIncident = terminalBus.on("distribution:incident", ({ headline, severity, kind }) => {
      useReliabilityStore.getState().appendAudit({
        category: "recovery",
        severity,
        summary: `Incident · ${kind}`,
        detail: headline,
      });
    });

    const unsubOrderError = useTerminalStore.subscribe((s) => s.orderError, (err) => {
      if (!err) return;
      useReliabilityStore.getState().appendAudit({
        category: "execution",
        severity: "watch",
        summary: "Execution error",
        detail: err,
      });
    });

    return () => {
      window.clearInterval(id);
      offAlert();
      offFocus();
      offStream();
      offDist();
      offIncident();
      unsubOrderError();
    };
  }, [enabled]);
}
