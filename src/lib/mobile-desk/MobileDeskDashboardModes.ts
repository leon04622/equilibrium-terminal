import type { MobileDeskDashboardMode } from "@/types/mobile-operational";

export const MOBILE_DESK_DASHBOARD_MODES: MobileDeskDashboardMode[] = [
  {
    id: "awareness",
    label: "Continuous awareness",
    description: "Intel feed, watchlist, and market summaries.",
    panels: ["mobiledesk", "newswire", "intelligence", "alerts"],
  },
  {
    id: "alert_focus",
    label: "Alert focus",
    description: "Push delivery and institutional alert routing.",
    panels: ["mobiledesk", "alerts", "reliability"],
  },
  {
    id: "portfolio_oversight",
    label: "Portfolio oversight",
    description: "Exposure, collateral, and treasury away from desk.",
    panels: ["mobiledesk", "portfoliodesk", "positions"],
  },
  {
    id: "incident_response",
    label: "Incident response",
    description: "Emergency workflows for operational stress.",
    panels: ["mobiledesk", "newswire", "dailyops"],
  },
  {
    id: "handoff",
    label: "Desk handoff",
    description: "Cross-device session continuity to desktop.",
    panels: ["mobiledesk", "chart", "ticket"],
  },
];
