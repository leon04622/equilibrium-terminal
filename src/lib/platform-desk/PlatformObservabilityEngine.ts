import { InstitutionalApiGatewayEngine } from "@/lib/platform-desk/InstitutionalApiGatewayEngine";
import type { PlatformObservabilityRow } from "@/types/platform-extensibility";

export class PlatformObservabilityEngine {
  static metrics(): PlatformObservabilityRow[] {
    return InstitutionalApiGatewayEngine.endpoints()
      .slice(0, 14)
      .map((e) => ({
        route: e.path,
        p50Ms: e.latencyMs,
        p99Ms: Math.round(e.latencyMs * 2.4),
        errorRatePct: e.status === "live" ? 0.2 + (e.id.length % 5) * 0.1 : 1.2,
        requestsPerMin: e.requestsPerMin,
      }));
  }
}
