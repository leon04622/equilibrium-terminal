"use client";

import { useEffect, useRef } from "react";
import type { Layout } from "react-grid-layout";
import { CollaborationOrchestrator } from "@/lib/collaboration";
import { crdtWorkspaceCoordinator } from "@/lib/network/CrdtWorkspaceCoordinator";
import { terminalBus } from "@/store/eventBus";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { DeskRole } from "@/types/network";
import type { TeamRole } from "@/types/production-platform";

const TICK_MS = 8_000;
const SYNC_MS = 45_000;
const LAYOUT_SYNC_MS = 20_000;

function mapPlatformToDeskRole(role: TeamRole): DeskRole {
  if (role === "admin") return "admin";
  if (role === "trader") return "lead";
  return "analyst";
}

export function useCollaboration(
  enabled = true,
  layout?: Layout[],
): void {
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const lastLayoutFpRef = useRef("");
  const lastBriefingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const bridgeAuth = () => {
      const platformRole = useProductionConfigStore.getState().primaryRole();
      const deskRole = mapPlatformToDeskRole(platformRole);
      useNetworkGraphStore.setState({ localRole: deskRole });
    };

    bridgeAuth();
    const unsubAuth = useProductionConfigStore.subscribe(
      (s) => s.session?.userId,
      bridgeAuth,
    );

    const refresh = (force = false) => {
      if (!force && document.hidden) return;
      const snapshot = CollaborationOrchestrator.snapshot();
      useCollaborationStore.getState().setSnapshot(snapshot);

      for (const comm of snapshot.communications.filter((c) => c.kind === "briefing")) {
        if (lastBriefingRef.current.has(comm.id)) continue;
        lastBriefingRef.current.add(comm.id);
        terminalBus.emit("collaboration:briefing", {
          id: comm.id,
          headline: comm.headline,
          deskId: comm.deskId,
        });
      }

      const focused = snapshot.presence.find((p) => p.memberId === useNetworkGraphStore.getState().localTraderId);
      if (focused) {
        terminalBus.emit("collaboration:presence", {
          memberId: focused.memberId,
          status: focused.status,
          activeCoin: focused.activeCoin,
        });
      }
    };

    refresh(true);
    const tickId = window.setInterval(() => refresh(), TICK_MS);

    const syncId = window.setInterval(() => {
      if (document.hidden) return;
      const snap = useCollaborationStore.getState().snapshot;
      if (!snap) return;
      void fetch("/api/collaboration/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deskId: snap.deskId,
          activity: snap.activity.slice(0, 16),
          annotations: snap.annotations.slice(0, 16),
        }),
      }).catch(() => undefined);
    }, SYNC_MS);

    const layoutSyncId = window.setInterval(() => {
      if (document.hidden) return;
      const currentLayout = layoutRef.current;
      if (!currentLayout?.length) return;
      const entitled = useProductionConfigStore.getState().isEntitled("teamNetEnabled");
      const canShare = useCollaborationStore.getState().snapshot?.permissions.canShareLayout;
      if (!entitled && !canShare) return;

      const fp = currentLayout.map((l) => `${l.i}:${l.x},${l.y},${l.w},${l.h}`).join("|");
      if (fp === lastLayoutFpRef.current) return;
      lastLayoutFpRef.current = fp;

      const deskId = useNetworkGraphStore.getState().activeDeskId;
      crdtWorkspaceCoordinator.publishLayoutPatch(deskId, currentLayout);
    }, LAYOUT_SYNC_MS);

    const offLayout = terminalBus.on("network:layout", ({ deskId, layout: remoteLayout }) => {
      if (deskId !== useNetworkGraphStore.getState().activeDeskId) return;
      terminalBus.emit("layout:refresh", {});
      void remoteLayout;
    });

    const offIntel = terminalBus.on("intelligence:engine", ({ id, summary, coin }) => {
      const deskId = useNetworkGraphStore.getState().activeDeskId;
      const localId = useNetworkGraphStore.getState().localTraderId;
      const canAnnotate = useCollaborationStore.getState().snapshot?.permissions.canAnnotate;
      if (!canAnnotate) return;

      crdtWorkspaceCoordinator.publishAnnotation(deskId, {
        id: `ann-intel-${id}`,
        coin,
        price: useTerminalStore.getState().book?.mid ?? 0,
        label: summary.slice(0, 64),
        authorId: localId,
        timestamp: Date.now(),
      });

      terminalBus.emit("collaboration:annotation", {
        id: `ann-intel-${id}`,
        coin,
        kind: "event",
      });
    });

    const offCrdt = terminalBus.on("network:crdt", () => refresh());
    const offSignal = terminalBus.on("network:signal-trace", () => refresh());
    const unsubSignals = useNetworkGraphStore.subscribe((s) => s.signalsVersion, () => refresh());
    const unsubNet = useNetworkGraphStore.subscribe((s) => s.activeDeskId, () => refresh());

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      window.clearInterval(layoutSyncId);
      offLayout();
      offIntel();
      offCrdt();
      offSignal();
      unsubSignals();
      unsubNet();
      unsubAuth();
    };
  }, [enabled]);
}
