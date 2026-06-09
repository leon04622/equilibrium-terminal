import { InstitutionalApiGatewayEngine } from "@/lib/platform-desk/InstitutionalApiGatewayEngine";
import { PluginExtensibilityEngine } from "@/lib/platform-desk/PluginExtensibilityEngine";
import { SdkEcosystemEngine } from "@/lib/platform-desk/SdkEcosystemEngine";
import { WebhookEventDeliveryEngine } from "@/lib/platform-desk/WebhookEventDeliveryEngine";
import type { PlatformDeskTelemetrySnapshot } from "@/types/platform-extensibility";

let startedAt = 0;

export class PlatformDeskTelemetry {
  static begin(): void {
    startedAt = performance.now();
  }

  static snapshot(_asset: string): PlatformDeskTelemetrySnapshot {
    const gateway = InstitutionalApiGatewayEngine.endpoints();
    const liveEndpoints = gateway.filter((e) => e.status === "live").length;
    const webhookDeliveries24h = WebhookEventDeliveryEngine.subscriptions().reduce(
      (s, w) => s + w.deliveries24h,
      0,
    );
    const extensibilityScore = Math.min(
      100,
      liveEndpoints * 4 +
        SdkEcosystemEngine.packages().length * 6 +
        PluginExtensibilityEngine.registry().filter((p) => p.status === "active").length * 8,
    );

    return {
      endpointCount: gateway.length,
      liveEndpoints,
      sdkCount: SdkEcosystemEngine.packages().length,
      activePlugins: PluginExtensibilityEngine.registry().filter((p) => p.status === "active")
        .length,
      webhookDeliveries24h,
      computeLatencyMs: Math.round(performance.now() - startedAt),
      extensibilityScore,
    };
  }
}
