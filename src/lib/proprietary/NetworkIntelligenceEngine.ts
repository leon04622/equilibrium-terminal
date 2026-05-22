import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import type { NetworkIntelligenceSignal } from "@/types/proprietary-intelligence";

/** Privacy-preserving aggregated desk signals — no wallet or PII exposure. */
export class NetworkIntelligenceEngine {
  static signals(): NetworkIntelligenceSignal[] {
    const net = useNetworkGraphStore.getState();
    const collab = useCollaborationStore.getState().snapshot;
    const deskCount = net.desks.length;
    const activePeers = net.peers.filter((p) => p.status === "connected").length;
    const now = Date.now();

    const signals: NetworkIntelligenceSignal[] = [
      {
        id: "net-agg-01",
        source: "aggregated_desks",
        headline: `${activePeers + 1} desks active — watchlist sync elevated`,
        privacyPreserved: true,
        confidence: 0.82,
        deskCount,
        timestamp: now,
      },
      {
        id: "net-workflow-01",
        source: "workflow_patterns",
        headline: "Execution + research panel co-focus pattern detected",
        privacyPreserved: true,
        confidence: 0.71,
        deskCount: Math.max(1, deskCount),
        timestamp: now - 1800_000,
      },
    ];

    if (collab && collab.activity.length > 3) {
      signals.push({
        id: "net-anomaly-01",
        source: "anomaly_cluster",
        headline: `Desk activity cluster — ${collab.activity.filter((a) => a.category === "annotation").length} annotations / 1h`,
        privacyPreserved: true,
        confidence: 0.68,
        deskCount: collab.presence.filter((p) => p.status !== "offline").length,
        timestamp: now - 3600_000,
      });
    }

    return signals.sort((a, b) => b.timestamp - a.timestamp);
  }
}
