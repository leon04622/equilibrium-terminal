import { ExternalApiEngine } from "@/lib/integrations/ExternalApiEngine";
import { EmbeddableInfrastructureEngine } from "@/lib/integrations/EmbeddableInfrastructureEngine";
import type { DeveloperEcosystemModule } from "@/types/crypto-ecosystem";

export class DeveloperEcosystemEngine {
  static modules(): DeveloperEcosystemModule[] {
    const apis = ExternalApiEngine.endpoints().map((api) => ({
      id: api.id,
      name: api.path,
      type: "api" as const,
      endpoint: api.path,
      status:
        api.status === "live"
          ? ("operational" as const)
          : api.status === "connected"
            ? ("operational" as const)
            : ("staged" as const),
      consumers: api.requestsPerMin,
    }));

    const embeds = EmbeddableInfrastructureEngine.widgets().map((w) => ({
      id: w.id,
      name: w.name,
      type: "plugin" as const,
      endpoint: w.endpoint,
      status:
        w.status === "live" || w.status === "connected"
          ? ("operational" as const)
          : ("staged" as const),
      consumers: w.subscribers,
    }));

    const sdk: DeveloperEcosystemModule = {
      id: "sdk-eq-v1",
      name: "EQUILIBRIUM TERMINAL SDK (STAGED)",
      type: "sdk",
      endpoint: "npm:@equilibrium/terminal-sdk",
      status: "staged",
      consumers: 0,
    };

    const webhook: DeveloperEcosystemModule = {
      id: "wh-distribution",
      name: "Distribution Webhook Gateway",
      type: "webhook",
      endpoint: "/api/distribution/webhook",
      status: "operational",
      consumers: 8,
    };

    return [...apis, ...embeds, sdk, webhook];
  }
}
