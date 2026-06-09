import type { LiveDeploymentDashboardMode } from "@/types/live-deployment";

export const LIVE_DEPLOYMENT_DASHBOARD_MODES: LiveDeploymentDashboardMode[] = [
  {
    id: "alpha_control",
    label: "Alpha control",
    description: "Invite gate · cohorts · feature flags · org provisioning",
    panels: ["livedeploy", "alphalab", "billingdesk", "deskops"],
  },
  {
    id: "infra_validation",
    label: "Infra validation",
    description: "Streams · execution · intel · reliability under live markets",
    panels: ["livedeploy", "reliability", "execintel", "marketcmd"],
  },
  {
    id: "telemetry_ops",
    label: "Telemetry ops",
    description: "Workflow depth · retention · command usage",
    panels: ["livedeploy", "dailyops", "traderjournal", "liveexec"],
  },
  {
    id: "enterprise_go_live",
    label: "Enterprise go-live",
    description: "Demos · onboarding · runbooks · readiness",
    panels: ["livedeploy", "commercial", "platformdesk", "opscommand"],
  },
  {
    id: "incident_ready",
    label: "Incident ready",
    description: "Support · escalation · runtime controls · rollback",
    panels: ["livedeploy", "opscommand", "reliability", "diagnostics"],
  },
];
