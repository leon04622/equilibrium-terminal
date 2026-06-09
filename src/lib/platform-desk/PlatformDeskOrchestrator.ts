import { ApiAuthorizationEngine } from "@/lib/platform-desk/ApiAuthorizationEngine";
import { DeveloperExperienceEngine } from "@/lib/platform-desk/DeveloperExperienceEngine";
import { EmbeddablePlatformEngine } from "@/lib/platform-desk/EmbeddablePlatformEngine";
import { EnterpriseIntegrationEngine } from "@/lib/platform-desk/EnterpriseIntegrationEngine";
import { InstitutionalApiGatewayEngine } from "@/lib/platform-desk/InstitutionalApiGatewayEngine";
import { PLATFORM_DESK_DASHBOARD_MODES } from "@/lib/platform-desk/PlatformDeskDashboardModes";
import { PlatformDeskTelemetry } from "@/lib/platform-desk/PlatformDeskTelemetry";
import { PlatformIntegrationBriefEngine } from "@/lib/platform-desk/PlatformIntegrationBriefEngine";
import { PlatformObservabilityEngine } from "@/lib/platform-desk/PlatformObservabilityEngine";
import { PluginExtensibilityEngine } from "@/lib/platform-desk/PluginExtensibilityEngine";
import { QuantResearchApiEngine } from "@/lib/platform-desk/QuantResearchApiEngine";
import { SdkEcosystemEngine } from "@/lib/platform-desk/SdkEcosystemEngine";
import { WebhookEventDeliveryEngine } from "@/lib/platform-desk/WebhookEventDeliveryEngine";
import type {
  PlatformDeskModeId,
  PlatformDeskSnapshot,
} from "@/types/platform-extensibility";

const MODE_STORAGE = "eq-platform-desk-mode-v1";

function readMode(): PlatformDeskModeId {
  if (typeof window === "undefined") return "api_gateway";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && PLATFORM_DESK_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as PlatformDeskModeId;
    }
  } catch {
    /* ignore */
  }
  return "api_gateway";
}

export class PlatformDeskOrchestrator {
  static snapshot(asset: string): PlatformDeskSnapshot {
    PlatformDeskTelemetry.begin();
    const telemetry = PlatformDeskTelemetry.snapshot(asset);
    const platformScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          telemetry.extensibilityScore * 0.6 +
            telemetry.liveEndpoints * 2 +
            telemetry.activePlugins * 3 +
            telemetry.webhookDeliveries24h * 0.05,
        ),
      ),
    );

    return {
      asset,
      gateway: InstitutionalApiGatewayEngine.endpoints(),
      sdks: SdkEcosystemEngine.packages(),
      plugins: PluginExtensibilityEngine.registry(),
      quantApis: QuantResearchApiEngine.surfaces(asset),
      webhooks: WebhookEventDeliveryEngine.subscriptions(),
      enterprise: EnterpriseIntegrationEngine.connectors(),
      apiKeys: ApiAuthorizationEngine.keys(),
      devResources: DeveloperExperienceEngine.resources(),
      embeddables: EmbeddablePlatformEngine.surfaces(),
      observability: PlatformObservabilityEngine.metrics(),
      integrationBrief: PlatformIntegrationBriefEngine.brief(asset),
      dashboardModes: PLATFORM_DESK_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      platformScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: PlatformDeskModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
