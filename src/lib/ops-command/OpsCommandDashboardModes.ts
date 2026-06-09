import type { OpsCommandDashboardMode } from "@/types/ops-command";

export const OPS_COMMAND_DASHBOARD_MODES: OpsCommandDashboardMode[] = [
  {
    id: "command_center",
    label: "Command center",
    description: "Admin dashboard, observability, runtime controls.",
    panels: ["opscommand", "infra", "dailyops"],
  },
  {
    id: "incident_ops",
    label: "Incident ops",
    description: "Incidents, runbooks, reliability, newswire.",
    panels: ["opscommand", "reliability", "newswire"],
  },
  {
    id: "release_control",
    label: "Release control",
    description: "Feature flags, deployments, commercial readiness.",
    panels: ["opscommand", "commercial", "infra"],
  },
  {
    id: "customer_support",
    label: "Customer support",
    description: "Tickets, org admin, enterprise ops.",
    panels: ["opscommand", "enterpriseops", "commercial"],
  },
  {
    id: "security_audit",
    label: "Security & audit",
    description: "Audit trail, permissions, security vitals.",
    panels: ["opscommand", "reliability", "enterpriseops"],
  },
];
