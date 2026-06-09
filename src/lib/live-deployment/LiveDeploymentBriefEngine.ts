import type { LiveDeploymentSnapshot } from "@/types/live-deployment";

export class LiveDeploymentBriefEngine {
  static brief(
    partial: Pick<
      LiveDeploymentSnapshot,
      "telemetryMeta" | "successIndicators" | "iterationFocus"
    >,
  ): string {
    const met = partial.successIndicators.filter((s) => s.met).length;
    const total = partial.successIndicators.length;
    const focus = partial.iterationFocus[0] ?? "operational quality";

    return [
      `Deployment ${partial.telemetryMeta.deploymentScore} · rollout ${partial.telemetryMeta.rolloutPct}%.`,
      `Alpha gates: ${partial.telemetryMeta.inviteValidated ? "validated" : "pending"}${partial.telemetryMeta.killSwitchActive ? " · kill-switch" : ""}.`,
      `Success ${met}/${total} · focus: ${focus}.`,
      "Real-world usage drives priorities — not feature expansion.",
    ].join(" ");
  }
}
