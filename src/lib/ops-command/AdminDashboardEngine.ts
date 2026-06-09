import { AdminPlatformEngine } from "@/lib/commercial/AdminPlatformEngine";
import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { IngestOrchestrator } from "@/lib/ingest/IngestOrchestrator";
import type { AdminDomainRow } from "@/types/ops-command";

export class AdminDashboardEngine {
  static domains(): AdminDomainRow[] {
    const base = AdminPlatformEngine.rows().map((r, i) => ({
      id: `adm-${i}`,
      domain: r.domain,
      status: r.status,
      detail: r.detail,
    }));

    const ingest = IngestOrchestrator.snapshot();
    const stream = DevOpsOperationsOrchestrator.snapshot().stream;
    base.push({
      id: "adm-ingest",
      domain: "Ingestion pipeline",
      status: ingest.quality.overallTrust >= 70 ? "operational" : "degraded",
      detail: `${ingest.sources.filter((s) => s.health === "live").length} live sources`,
    });

    base.push({
      id: "adm-ws",
      domain: "WebSocket gateway",
      status: stream.wsConnected ? "operational" : "degraded",
      detail: `Lag ${stream.ingestionLagMs}ms · ${stream.reconnectCount} reconnects`,
    });

    return base;
  }
}
