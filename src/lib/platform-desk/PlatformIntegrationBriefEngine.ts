import { InstitutionalApiGatewayEngine } from "@/lib/platform-desk/InstitutionalApiGatewayEngine";
import { SdkEcosystemEngine } from "@/lib/platform-desk/SdkEcosystemEngine";
import { WebhookEventDeliveryEngine } from "@/lib/platform-desk/WebhookEventDeliveryEngine";

export class PlatformIntegrationBriefEngine {
  static brief(asset: string): string {
    const live = InstitutionalApiGatewayEngine.endpoints().filter((e) => e.status === "live").length;
    const sdks = SdkEcosystemEngine.packages().filter((s) => s.status !== "staged").length;
    const wh = WebhookEventDeliveryEngine.subscriptions().filter((w) => w.status === "active").length;
    return [
      `Platform layer · ${asset}`,
      `${live} live gateway routes · ${sdks} SDK channels · ${wh} active webhooks`,
      "Human-operated integrations — no autonomous execution via API.",
      "Use scoped API keys; signed requests for enterprise tier.",
    ].join("\n");
  }
}
