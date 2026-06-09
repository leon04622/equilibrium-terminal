import { DeploymentOrchestrator } from "@/lib/devops/DeploymentOrchestrator";
import type { ReleaseSnapshot } from "@/types/commercial-product";

export class ReleaseManagementEngine {
  static snapshot(): ReleaseSnapshot {
    const release = DeploymentOrchestrator.currentRelease();
    const channel =
      release.channel === "canary"
        ? "canary"
        : release.channel === "blue" || release.channel === "green"
          ? "beta"
          : "stable";

    return {
      channel,
      version: release.version,
      buildId: release.buildId,
      rolloutPct: channel === "canary" ? 12 : channel === "beta" ? 35 : 100,
      canaryEnabled: channel === "canary",
      changelogUrl: "/docs/COMMERCIAL_PRODUCT.md#release-channels",
      lastRollbackAt: null,
    };
  }
}
