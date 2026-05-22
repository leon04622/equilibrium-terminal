import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import type { StorageLayerStatus } from "@/types/data-ingestion";

/** Layered storage routing — hot active; warm/cold staged for infrastructure expansion. */
export class StorageLayerRouter {
  static status(): StorageLayerStatus[] {
    const hotCount = IngestStreamBuffer.count();
    return [
      {
        tier: "hot",
        label: "Live stream buffer",
        backend: "in-memory ring",
        itemCount: hotCount,
        capacityHint: "512 events",
        status: "active",
      },
      {
        tier: "warm",
        label: "Timescale / PostgreSQL",
        backend: "TimescaleDB (staged)",
        itemCount: 0,
        capacityHint: "7d rolling",
        status: "staged",
      },
      {
        tier: "cold",
        label: "Historical archive",
        backend: "S3 / object storage (staged)",
        itemCount: 0,
        capacityHint: "unlimited",
        status: "staged",
      },
    ];
  }
}
