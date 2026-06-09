import { AlphaFeatureFlags } from "@/lib/alpha/AlphaFeatureFlags";
import { InviteGateEngine } from "@/lib/alpha/InviteGateEngine";
import { OrganizationWorkspaceDeskEngine } from "@/lib/desk-ops/OrganizationWorkspaceDeskEngine";
import type { DeploymentControlRow } from "@/types/live-deployment";

export class ControlledAlphaDeploymentEngine {
  static controls(): DeploymentControlRow[] {
    const flags = AlphaFeatureFlags.all();
    const workspaces = OrganizationWorkspaceDeskEngine.workspaces();

    return [
      {
        id: "dep-invite",
        control: "invite_gate",
        state: InviteGateEngine.isValidated() ? "validated" : "required",
        governance: InviteGateEngine.inviteRequired() ? "invite-only" : "open-dev",
      },
      {
        id: "dep-cohort",
        control: "alpha_cohort",
        state: InviteGateEngine.cohort() ?? "unassigned",
        governance: "segmented rollout",
      },
      {
        id: "dep-orgs",
        control: "org_workspaces",
        state: `${workspaces.length} provisioned`,
        governance: "desk isolation",
      },
      ...flags.slice(0, 4).map((f) => ({
        id: `dep-flag-${f.id}`,
        control: f.label,
        state: f.killSwitch ? "killed" : f.enabled ? "on" : "gated",
        governance: f.killSwitch ? "kill-switch" : "feature gate",
      })),
    ];
  }
}
