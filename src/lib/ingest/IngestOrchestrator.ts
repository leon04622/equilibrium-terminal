import { DataSourceRegistry } from "@/lib/ingest/DataSourceRegistry";
import { IngestQualityGovernor } from "@/lib/ingest/IngestQualityGovernor";
import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { StorageLayerRouter } from "@/lib/ingest/StorageLayerRouter";
import { StreamProcessingEngine } from "@/lib/ingest/StreamProcessingEngine";
import { platformWebSocketGateway } from "@/lib/infrastructure/WebSocketGateway";
import type { DataIngestionSnapshot, IngestPipelineStatus } from "@/types/data-ingestion";

function pipelineStatus(): IngestPipelineStatus[] {
  const gateway = platformWebSocketGateway.getMetrics();
  const dedupe = IngestQualityGovernor.dedupeSuppressed();
  return [
    {
      id: "hl-ws",
      label: "Hyperliquid WebSocket",
      transport: "websocket",
      status: gateway.status === "connected" ? "live" : gateway.status === "reconnecting" ? "degraded" : "offline",
      backlog: 0,
      dedupeSuppressed: dedupe,
      reconnectCount: gateway.reconnectCount,
      lastFlushAt: gateway.lastMessageAt,
    },
    {
      id: "staged-rest",
      label: "Staged REST pollers",
      transport: "rest_poll",
      status: "staged",
      backlog: 0,
      dedupeSuppressed: 0,
      reconnectCount: 0,
      lastFlushAt: null,
    },
    {
      id: "webhook-ingest",
      label: "Webhook ingest",
      transport: "webhook",
      status: "staged",
      backlog: 0,
      dedupeSuppressed: 0,
      reconnectCount: 0,
      lastFlushAt: null,
    },
  ];
}

export class IngestOrchestrator {
  static snapshot(): DataIngestionSnapshot {
    const sources = DataSourceRegistry.list();
    const quality = IngestQualityGovernor.audit();
    const processing = StreamProcessingEngine.compute();
    const live = DataSourceRegistry.liveCount();

    const ingestScore = Math.round(
      quality.overallTrust * 0.4 +
        processing.liquidityScore * 0.2 +
        (live / Math.max(sources.length, 1)) * 100 * 0.2 +
        (100 - quality.staleFeedCount * 8) * 0.2,
    );

    return {
      sources,
      recentEvents: IngestStreamBuffer.recent(32),
      processing,
      quality,
      storage: StorageLayerRouter.status(),
      pipelines: pipelineStatus(),
      ingestScore: Math.min(100, Math.max(0, ingestScore)),
      updatedAt: Date.now(),
    };
  }
}
