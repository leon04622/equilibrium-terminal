import { crdtWorkspaceCoordinator } from "@/lib/network/CrdtWorkspaceCoordinator";
import type { CrdtOperation } from "@/types/network";

/**
 * Simulated federated desk transport — delta broadcasts via BroadcastChannel
 * with in-process fallback. Targets <30ms delivery on LAN mesh.
 */
export class NetworkTransport {
  private static instance: NetworkTransport | null = null;

  private channel: BroadcastChannel | null = null;
  private started = false;

  static getInstance(): NetworkTransport {
    if (!NetworkTransport.instance) {
      NetworkTransport.instance = new NetworkTransport();
    }
    return NetworkTransport.instance;
  }

  start(deskId: string): void {
    if (typeof window === "undefined" || this.started) return;
    this.started = true;

    try {
      this.channel = new BroadcastChannel(`eq-network-${deskId}`);
      this.channel.onmessage = (ev) => {
        const op = ev.data as CrdtOperation;
        if (!op?.opId) return;
        if (op.peerId === crdtWorkspaceCoordinator.getLocalPeerId()) return;
        crdtWorkspaceCoordinator.applyRemote(op);
      };
    } catch {
      this.channel = null;
    }

    crdtWorkspaceCoordinator.onBroadcast((op) => {
      if (this.channel) {
        this.channel.postMessage(op);
      }
    });
  }

  stop(): void {
    this.started = false;
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }

  simulatePeerDelta(op: CrdtOperation, delayMs = 12): void {
    window.setTimeout(() => {
      crdtWorkspaceCoordinator.applyRemote(op);
    }, delayMs);
  }
}

export const networkTransport = NetworkTransport.getInstance();
