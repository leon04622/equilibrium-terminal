import { terminalBus } from "@/store/eventBus";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ChartAnnotation, CrdtOperation } from "@/types/network";
import type { Layout } from "react-grid-layout";

interface LwwEntry<T> {
  value: T;
  lamport: number;
  peerId: string;
}

export interface CrdtDeskState {
  watchlist: Set<string>;
  annotations: Map<string, LwwEntry<ChartAnnotation>>;
  layout: LwwEntry<Layout[] | null>;
  lamport: number;
}

export type CrdtApplyHandler = (op: CrdtOperation) => void;

/**
 * Lightweight LWW-register CRDT coordinator for team desks.
 * Applies remote deltas via queueMicrotask to preserve <30ms UI budget.
 */
export class CrdtWorkspaceCoordinator {
  private static instance: CrdtWorkspaceCoordinator | null = null;

  private desks = new Map<string, CrdtDeskState>();
  private localPeerId: string;
  private broadcastHandlers: Array<(op: CrdtOperation) => void> = [];

  private constructor() {
    this.localPeerId = `peer-${Math.random().toString(36).slice(2, 10)}`;
  }

  static getInstance(): CrdtWorkspaceCoordinator {
    if (!CrdtWorkspaceCoordinator.instance) {
      CrdtWorkspaceCoordinator.instance = new CrdtWorkspaceCoordinator();
    }
    return CrdtWorkspaceCoordinator.instance;
  }

  getLocalPeerId(): string {
    return this.localPeerId;
  }

  onBroadcast(handler: (op: CrdtOperation) => void): () => void {
    this.broadcastHandlers.push(handler);
    return () => {
      this.broadcastHandlers = this.broadcastHandlers.filter((h) => h !== handler);
    };
  }

  ensureDesk(deskId: string): CrdtDeskState {
    let desk = this.desks.get(deskId);
    if (!desk) {
      desk = {
        watchlist: new Set(),
        annotations: new Map(),
        layout: { value: null, lamport: 0, peerId: this.localPeerId },
        lamport: 0,
      };
      this.desks.set(deskId, desk);
    }
    return desk;
  }

  private nextLamport(desk: CrdtDeskState): number {
    desk.lamport += 1;
    return desk.lamport;
  }

  private emitLocal(op: CrdtOperation): void {
    queueMicrotask(() => {
      for (const h of this.broadcastHandlers) h(op);
    });
  }

  broadcast(op: CrdtOperation): void {
    this.emitLocal(op);
    terminalBus.emit("network:crdt", { op });
    useNetworkGraphStore.getState().recordOperation(op);
  }

  applyRemote(op: CrdtOperation): void {
    queueMicrotask(() => this.merge(op));
  }

  private merge(op: CrdtOperation): void {
    const desk = this.ensureDesk(op.deskId);

    switch (op.type) {
      case "watchlist_add": {
        const coin = String(op.payload.coin ?? "").toUpperCase();
        if (!coin) return;
        desk.watchlist.add(coin);
        useNetworkGraphStore.getState().applySharedWatchlist(
          op.deskId,
          Array.from(desk.watchlist),
        );
        if (useNetworkGraphStore.getState().activeDeskId === op.deskId) {
          const selected = useTerminalStore.getState().selectedCoin.toUpperCase();
          if (selected !== coin) {
            useTerminalStore.getState().selectAssetByCoin(coin, "team-desk");
          }
        }
        break;
      }
      case "watchlist_remove": {
        const coin = String(op.payload.coin ?? "").toUpperCase();
        desk.watchlist.delete(coin);
        useNetworkGraphStore.getState().applySharedWatchlist(
          op.deskId,
          Array.from(desk.watchlist),
        );
        break;
      }
      case "layout_patch": {
        const incoming = op.payload.layout as Layout[] | undefined;
        if (!incoming) return;
        const current = desk.layout;
        if (op.lamport >= current.lamport) {
          desk.layout = { value: incoming, lamport: op.lamport, peerId: op.peerId };
          terminalBus.emit("network:layout", {
            deskId: op.deskId,
            layout: incoming,
          });
        }
        break;
      }
      case "annotation_add": {
        const ann = op.payload.annotation as ChartAnnotation | undefined;
        if (!ann) return;
        const prev = desk.annotations.get(ann.id);
        if (!prev || op.lamport >= prev.lamport) {
          desk.annotations.set(ann.id, {
            value: ann,
            lamport: op.lamport,
            peerId: op.peerId,
          });
          useNetworkGraphStore.getState().upsertAnnotation(op.deskId, ann);
        }
        break;
      }
      case "annotation_remove": {
        const id = String(op.payload.id ?? "");
        const prev = desk.annotations.get(id);
        if (!prev || op.lamport >= prev.lamport) {
          desk.annotations.delete(id);
          useNetworkGraphStore.getState().removeAnnotation(op.deskId, id);
        }
        break;
      }
    }
  }

  publishWatchlistAdd(deskId: string, coin: string): CrdtOperation {
    const desk = this.ensureDesk(deskId);
    const lamport = this.nextLamport(desk);
    desk.watchlist.add(coin.toUpperCase());
    const op: CrdtOperation = {
      opId: `op-${deskId}-${lamport}`,
      deskId,
      peerId: this.localPeerId,
      lamport,
      type: "watchlist_add",
      payload: { coin: coin.toUpperCase() },
      timestamp: Date.now(),
    };
    this.broadcast(op);
    return op;
  }

  publishLayoutPatch(deskId: string, layout: Layout[]): CrdtOperation {
    const desk = this.ensureDesk(deskId);
    const lamport = this.nextLamport(desk);
    desk.layout = { value: layout, lamport, peerId: this.localPeerId };
    const op: CrdtOperation = {
      opId: `op-${deskId}-${lamport}`,
      deskId,
      peerId: this.localPeerId,
      lamport,
      type: "layout_patch",
      payload: { layout },
      timestamp: Date.now(),
    };
    this.broadcast(op);
    return op;
  }

  publishAnnotation(deskId: string, annotation: ChartAnnotation): CrdtOperation {
    const desk = this.ensureDesk(deskId);
    const lamport = this.nextLamport(desk);
    desk.annotations.set(annotation.id, {
      value: annotation,
      lamport,
      peerId: this.localPeerId,
    });
    const op: CrdtOperation = {
      opId: `op-${deskId}-${lamport}`,
      deskId,
      peerId: this.localPeerId,
      lamport,
      type: "annotation_add",
      payload: { annotation },
      timestamp: Date.now(),
    };
    this.broadcast(op);
    return op;
  }

  getWatchlist(deskId: string): string[] {
    return Array.from(this.ensureDesk(deskId).watchlist);
  }

  getAnnotations(deskId: string): ChartAnnotation[] {
    const desk = this.ensureDesk(deskId);
    return Array.from(desk.annotations.values()).map((e) => e.value);
  }
}

export const crdtWorkspaceCoordinator = CrdtWorkspaceCoordinator.getInstance();
