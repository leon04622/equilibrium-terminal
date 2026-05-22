"use client";

import { useEffect } from "react";
import { crdtWorkspaceCoordinator } from "@/lib/network/CrdtWorkspaceCoordinator";
import { knowledgeGraphIndexer } from "@/lib/network/KnowledgeGraphIndexer";
import { networkTransport } from "@/lib/network/NetworkTransport";
import { terminalBus } from "@/store/eventBus";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useTerminalStore } from "@/store/terminalStore";

/** Boots Phase 9 network mesh, CRDT coordinator, and graph indexer. */
export function useNetworkLayer(): void {
  const activeDeskId = useNetworkGraphStore((s) => s.activeDeskId);
  const signalsVersion = useNetworkGraphStore((s) => s.signalsVersion);

  useEffect(() => {
    const peerId = crdtWorkspaceCoordinator.getLocalPeerId();
    useNetworkGraphStore.setState({ localPeerId: peerId });

    networkTransport.start(activeDeskId);

    const offCrdt = terminalBus.on("network:crdt", ({ op }) => {
      if (op.peerId === useNetworkGraphStore.getState().localPeerId) return;
      crdtWorkspaceCoordinator.applyRemote(op);
    });

    const offAsset = terminalBus.on("asset:select", ({ coin, source }) => {
      if (source === "team-desk" || source === "store") return;
      const deskId = useNetworkGraphStore.getState().activeDeskId;
      const normalized = coin.toUpperCase();
      const desk = crdtWorkspaceCoordinator.ensureDesk(deskId);
      if (desk.watchlist.has(normalized)) return;
      crdtWorkspaceCoordinator.publishWatchlistAdd(deskId, coin);
    });

    return () => {
      offCrdt();
      offAsset();
      networkTransport.stop();
    };
  }, [activeDeskId]);

  useEffect(() => {
    const state = useNetworkGraphStore.getState();
    knowledgeGraphIndexer.indexProfiles(state.profiles);
    knowledgeGraphIndexer.indexSignals(state.signals, true);
  }, [signalsVersion]);

  useEffect(() => {
    return useTerminalStore.subscribe(
      (s) => s.trades[0]?.id,
      () => {
        const trade = useTerminalStore.getState().trades[0];
        if (!trade) return;
        useNetworkGraphStore.getState().recomputeReputation([
          {
            coin: trade.coin,
            px: trade.price,
            timestamp: trade.time,
          },
        ]);
        useNetworkGraphStore.getState().upsertPeer({
          peerId: useNetworkGraphStore.getState().localPeerId,
          walletAddress: "0x1111111111111111111111111111111111111111",
          status: "connected",
          rttMs: Math.round(8 + Math.random() * 12),
          lastSeenAt: Date.now(),
        });
      },
    );
  }, []);

  useEffect(() => {
    const store = useNetworkGraphStore.getState();
    const desk = store.desks[0];
    if (!desk) return;
    for (const coin of desk.sharedWatchlist) {
      crdtWorkspaceCoordinator.ensureDesk(desk.id).watchlist.add(coin);
    }

    const lead = store.getProfile(store.localTraderId);
    if (lead && store.signals.length === 0) {
      store.publishSignal({
        deskId: desk.id,
        publisherId: lead.id,
        publisherWallet: lead.walletAddress,
        coin: "HYPE",
        stance: "bullish",
        thesis: "Desk seed — funding compression + OI build on HYPE perp.",
        visibility: "team",
        encryptedScopeKey: desk.sandboxKey,
        targetPx: null,
      });
    }
  }, []);
}
