import { ReliabilityOrchestrator } from "@/lib/reliability/ReliabilityOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { DataQualityRow, HardeningStatus } from "@/types/launch-hardening";

function status(ok: boolean, warn?: boolean): HardeningStatus {
  if (ok) return "pass";
  if (warn) return "watch";
  return "fail";
}

export class DataQualityEngine {
  static checks(): DataQualityRow[] {
    const rel = ReliabilityOrchestrator.snapshot();
    const lastMsg = useTerminalStore.getState().lastMessageAt;
    const ageMs = lastMsg ? Date.now() - lastMsg : null;

    return [
      {
        check: "Timestamp integrity",
        status: status(rel.data.staleFeedCount === 0, rel.data.staleFeedCount <= 2),
        value: rel.data.staleFeedCount === 0 ? "SYNCED" : `${rel.data.staleFeedCount} stale`,
      },
      {
        check: "Normalization",
        status: status(rel.data.conflictCount === 0, rel.data.conflictCount <= 1),
        value: `${rel.data.conflictCount} conflicts`,
      },
      {
        check: "Stream reliability",
        status: status(rel.runtime.websocketHealth === "healthy"),
        value: rel.runtime.websocketHealth,
      },
      {
        check: "Message freshness",
        status: status(ageMs !== null && ageMs < 5000, ageMs !== null && ageMs < 15000),
        value: ageMs === null ? "—" : `${ageMs}ms`,
      },
      {
        check: "Source verification",
        status: status(rel.data.sourceVerification >= 85, rel.data.sourceVerification >= 65),
        value: `${rel.data.sourceVerification}%`,
      },
      {
        check: "Redundancy",
        status: status(rel.runtime.reconnectAttempts < 3),
        value: `${rel.runtime.reconnectAttempts} reconnects`,
      },
    ];
  }

  static score(rows: DataQualityRow[]): number {
    const weights = { pass: 100, watch: 65, fail: 25 };
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((a, r) => a + weights[r.status], 0) / rows.length);
  }
}
