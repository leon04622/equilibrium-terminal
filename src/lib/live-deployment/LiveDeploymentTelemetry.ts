import type { LiveDeploymentTelemetrySnapshot } from "@/types/live-deployment";

let t0 = 0;

export class LiveDeploymentTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    rolloutPct: number;
    inviteValidated: boolean;
    killSwitchActive: boolean;
    alphaScore: number;
    opsScore: number;
    successMet: number;
    successTotal: number;
  }): LiveDeploymentTelemetrySnapshot {
    const computeLatencyMs = Math.round(performance.now() - t0);
    const deploymentScore = Math.min(
      100,
      Math.round(
        input.alphaScore * 0.35 +
          input.opsScore * 0.25 +
          (input.successMet / Math.max(1, input.successTotal)) * 25 +
          (input.inviteValidated ? 10 : 0) +
          (input.killSwitchActive ? 0 : 8) +
          (computeLatencyMs < 45 ? 7 : 3),
      ),
    );

    return {
      rolloutPct: input.rolloutPct,
      inviteValidated: input.inviteValidated,
      killSwitchActive: input.killSwitchActive,
      deploymentScore,
      computeLatencyMs,
    };
  }
}
