import { EmbeddableInfrastructureEngine } from "@/lib/integrations/EmbeddableInfrastructureEngine";
import type { EmbeddableSurface } from "@/types/platform-extensibility";

export class EmbeddablePlatformEngine {
  static surfaces(): EmbeddableSurface[] {
    return EmbeddableInfrastructureEngine.widgets().map((w) => ({
      id: w.id,
      name: w.name,
      endpoint: w.endpoint,
      format: w.format,
      subscribers: w.subscribers,
      status:
        w.status === "live" || w.status === "connected" || w.status === "staged"
          ? w.status
          : ("staged" as const),
    }));
  }
}
