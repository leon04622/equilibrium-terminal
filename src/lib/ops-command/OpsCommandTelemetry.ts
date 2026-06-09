import { AdminDashboardEngine } from "@/lib/ops-command/AdminDashboardEngine";
import { FeatureFlagReleaseEngine } from "@/lib/ops-command/FeatureFlagReleaseEngine";
import { IncidentManagementEngine } from "@/lib/ops-command/IncidentManagementEngine";
import { PlatformObservabilityCenterEngine } from "@/lib/ops-command/PlatformObservabilityCenterEngine";
import type { OpsCommandTelemetrySnapshot } from "@/types/ops-command";

let startedAt = 0;

export class OpsCommandTelemetry {
  static begin(): void {
    startedAt = performance.now();
  }

  static snapshot(): OpsCommandTelemetrySnapshot {
    const services = PlatformObservabilityCenterEngine.services();
    const servicesHealthy = services.filter((s) => s.health === "operational").length;
    const openIncidents = IncidentManagementEngine.incidents().length;
    const flags = FeatureFlagReleaseEngine.flags();
    const domains = AdminDashboardEngine.domains();

    const controlScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          servicesHealthy * 12 +
            (domains.filter((d) => d.status === "operational").length / Math.max(1, domains.length)) *
              40 -
            openIncidents * 8,
        ),
      ),
    );

    return {
      openIncidents,
      servicesHealthy,
      serviceCount: services.length,
      flagCount: flags.length,
      computeLatencyMs: Math.round(performance.now() - startedAt),
      controlScore,
    };
  }
}
