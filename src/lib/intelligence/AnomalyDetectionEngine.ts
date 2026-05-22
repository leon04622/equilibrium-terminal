import { StreamProcessingEngine } from "@/lib/ingest/StreamProcessingEngine";

export class AnomalyDetectionEngine {
  static count(): number {
    return StreamProcessingEngine.compute().anomalyFlags.length;
  }

  static flags(): string[] {
    return StreamProcessingEngine.compute().anomalyFlags;
  }
}
