import type { DeskOpsDashboardMode } from "@/types/desk-operations";

export const DESK_OPS_DASHBOARD_MODES: DeskOpsDashboardMode[] = [
  {
    id: "desk_command",
    label: "Desk command",
    description: "Org workspaces, RBAC, tenant boundaries",
    panels: ["deskops", "collab", "enterpriseops"],
  },
  {
    id: "intel_share",
    label: "Shared intelligence",
    description: "Desk commentary, annotations, org feeds",
    panels: ["deskops", "collab", "intelengine"],
  },
  {
    id: "research_collab",
    label: "Research collab",
    description: "Thesis tracking, publications, review",
    panels: ["deskops", "researchdesk", "collab"],
  },
  {
    id: "ops_coordination",
    label: "Ops coordination",
    description: "Handoffs, alerts, desk visibility",
    panels: ["deskops", "mobiledesk", "enterpriseops"],
  },
  {
    id: "governance",
    label: "Governance",
    description: "Audit, permissions, organizational memory",
    panels: ["deskops", "enterpriseops", "opscommand"],
  },
];
