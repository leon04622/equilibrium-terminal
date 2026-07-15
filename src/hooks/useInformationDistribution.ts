"use client";

import { useEffect, useRef } from "react";
import { ensureWireSeeded } from "@/lib/distribution/wireSeed";
import { InformationDistributionOrchestrator } from "@/lib/distribution";
import { NotificationDeliveryEngine } from "@/lib/distribution/NotificationDeliveryEngine";
import { terminalBus } from "@/store/eventBus";
import { useInformationDistributionStore } from "@/store/useInformationDistributionStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_000;

export function useInformationDistribution(enabled = true): void {
  const lastCriticalRef = useRef<Set<string>>(new Set());
  const bootstrappedRef = useRef(false);
  const refreshQueuedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    useInformationDistributionStore.getState().hydratePrefs();

    const deliverSnapshot = (snapshot: ReturnType<typeof InformationDistributionOrchestrator.snapshot>) => {
      const prefs = NotificationDeliveryEngine.loadPrefs();

      if (!bootstrappedRef.current) {
        for (const item of snapshot.newswire) {
          if (NotificationDeliveryEngine.shouldDeliver(item.severity, prefs)) {
            lastCriticalRef.current.add(item.id);
          }
        }
        for (const inc of snapshot.incidents) {
          if (NotificationDeliveryEngine.shouldDeliver(inc.severity, prefs)) {
            lastCriticalRef.current.add(inc.id);
          }
        }
        bootstrappedRef.current = true;
        return;
      }

      for (const item of snapshot.newswire) {
        if (lastCriticalRef.current.has(item.id)) continue;
        if (!NotificationDeliveryEngine.shouldDeliver(item.severity, prefs)) continue;
        lastCriticalRef.current.add(item.id);
        terminalBus.emit("distribution:event", {
          id: item.id,
          category: item.category,
          severity: item.severity,
          headline: item.headline,
          coin: item.coin,
        });
        void NotificationDeliveryEngine.dispatchItem(item);
      }

      for (const inc of snapshot.incidents) {
        if (lastCriticalRef.current.has(inc.id)) continue;
        if (!NotificationDeliveryEngine.shouldDeliver(inc.severity, prefs)) continue;
        lastCriticalRef.current.add(inc.id);
        terminalBus.emit("distribution:incident", {
          id: inc.id,
          kind: inc.kind,
          severity: inc.severity,
          headline: inc.headline,
        });
        void NotificationDeliveryEngine.dispatchItem({
          id: inc.id,
          category: "operational",
          headline: inc.headline,
          detail: inc.detail,
          coin: inc.coin,
          severity: inc.severity,
          source: "INCIDENT",
          urgencyScore: inc.severity === "critical" ? 90 : 55,
          impactScore: inc.severity === "critical" ? 85 : 50,
          relevanceScore: 80,
          compositeScore: inc.severity === "critical" ? 82 : 52,
          confidence: inc.sourceVerified ? 0.9 : 0.7,
          verified: inc.sourceVerified,
          timestamp: inc.updatedAt,
        });
      }
    };

    const refresh = () => {
      ensureWireSeeded();
      const snapshot = InformationDistributionOrchestrator.snapshot();
      useInformationDistributionStore.getState().setSnapshot(snapshot);
      deliverSnapshot(snapshot);
    };

    const scheduleRefresh = () => {
      if (refreshQueuedRef.current) return;
      refreshQueuedRef.current = true;
      queueMicrotask(() => {
        refreshQueuedRef.current = false;
        refresh();
      });
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const syncId = window.setInterval(() => {
      const snap = useInformationDistributionStore.getState().snapshot;
      if (!snap?.newswire.length) return;
      void fetch("/api/distribution/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: snap.newswire.slice(0, 32) }),
      }).catch(() => undefined);
    }, 15_000);

    const offAlert = terminalBus.on("alert:triggered", scheduleRefresh);
    const offStream = terminalBus.on("stream:status", scheduleRefresh);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, scheduleRefresh);
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, scheduleRefresh);

    return () => {
      window.clearInterval(id);
      window.clearInterval(syncId);
      offAlert();
      offStream();
      unsubIntel();
      unsubConn();
    };
  }, [enabled]);
}
